import { ethers } from 'ethers';
import TribeControllerABI from '../abis/TribeController.json';
import { contractsConfig } from '../config/contracts.config';
import { networksConfig } from '../config/networks.config';

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Make sure MetaMask is installed and connected
 * 2. Switch to XDC network (Chain ID: 50)
 * 3. Ensure your account has XDC tokens for gas fees
 * 
 * The service will automatically use the XDC RPC from networks.config.ts
 */

// Types for Tribe creation
export interface NFTRequirement {
  nftContract: string;
  nftType: number; // 0: ERC721, 1: ERC1155, 2: ERC20
  isMandatory: boolean;
  minAmount: number;
  tokenIds: number[];
}

export interface CreateTribeParams {
  name: string;
  metadata: string; // JSON stringified metadata
  admins: string[]; // Array of admin addresses
  joinType: number; // 0: Public, 1: InviteOnly, 2: Whitelist, 3: NFTGated
  entryFee: number; // Entry fee in wei
  nftRequirements: NFTRequirement[];
}

export interface CreateTribeResult {
  tribeId: number;
  transactionHash: string;
}

export interface TribeDetails {
  name: string;
  metadata: string;
  admin: string;
  whitelist: string[];
  joinType: number;
  entryFee: number;
  nftRequirements: NFTRequirement[];
  memberCount: number;
  canMerge: boolean;
  isActive: boolean;
  availableInviteCodes: string[];
}

export interface TribeConfigView {
  joinType: number;
  entryFee: number;
  nftRequirements: NFTRequirement[];
  canMerge: boolean;
}

export interface MemberStatus {
  status: number; // 0: NONE, 1: ACTIVE, 2: PENDING, 3: BANNED
}

// JoinType enum values
export enum JoinType {
  Public = 0,
  InviteOnly = 1,
  Whitelist = 2,
  NFTGated = 3,
  MultiNFT = 4,
  AnyNFT = 5,
  InviteCode = 6
}

// MemberStatus enum values
export enum MemberStatusEnum {
  NONE = 0,
  ACTIVE = 1,
  PENDING = 2,
  BANNED = 3
}

// NFTType enum values
export enum NFTType {
  ERC721 = 0,
  ERC1155 = 1,
  ERC20 = 2
}

class TribeContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private isInitialized = false;

  // Initialize the contract service
  async initialize(): Promise<void> {
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and connect your wallet.');
      }

      // Get XDC network configuration
      const xdcConfig = networksConfig.xdc;
      
      // Request user to switch to XDC network if not already connected
      await this.requestXDCNetwork();
      
      // Create provider and signer using MetaMask
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get the current network
      const network = await this.provider.getNetwork();
      console.log("Current network:", network);
      const chainId = Number(network.chainId);

      // Verify we're on XDC network
      if (chainId !== networksConfig.xdc.chainId) {
        throw new Error(`Expected XDC network (Chain ID: ${networksConfig.xdc.chainId}), but connected to Chain ID: ${chainId}`);
      }

      const networkConfig = networksConfig.xdc;
      const contractAddress = contractsConfig.xdc.TribeController;

      console.log("Network configuration:", {
        networkKey: 'xdc',
        chainId,
        networkName: networkConfig.nativeCurrency.name,
        rpcUrl: networkConfig.rpcUrl,
        blockExplorerUrl: networkConfig.blockExplorerUrl,
        contractAddress
      });

      // Create contract instance
      this.contract = new ethers.Contract(
        contractAddress,
        TribeControllerABI.abi,
        this.signer
      );

      this.isInitialized = true;
      console.log('TribeContract service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TribeContract service:', error);
      throw error;
    }
  }

  // Request user to switch to XDC network
  private async requestXDCNetwork(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available');
      }
      
      const xdcConfig = networksConfig.xdc;
      
      // Check if we're already on XDC network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== `0x${xdcConfig.chainId.toString(16)}`) {
        console.log('Requesting to switch to XDC network...');
        
        // Request to add XDC network if not already added
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${xdcConfig.chainId.toString(16)}`,
              chainName: 'XDC Network',
              nativeCurrency: {
                name: xdcConfig.nativeCurrency.name,
                symbol: xdcConfig.nativeCurrency.symbol,
                decimals: xdcConfig.nativeCurrency.decimals,
              },
              rpcUrls: [xdcConfig.rpcUrl],
              blockExplorerUrls: [xdcConfig.blockExplorerUrl],
            }],
          });
        } catch (addError: any) {
          // If network already exists, just switch to it
          if (addError.code === 4902) {
            console.log('XDC network already exists, switching to it...');
          } else {
            console.log('Failed to add XDC network, trying to switch...');
          }
        }
        
        // Switch to XDC network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${xdcConfig.chainId.toString(16)}` }],
        });
        
        console.log('Successfully switched to XDC network');
      } else {
        console.log('Already connected to XDC network');
      }
    } catch (error) {
      console.error('Failed to switch to XDC network:', error);
      throw new Error('Please switch to XDC network in MetaMask manually');
    }
  }

  // Check if service is initialized
  private checkInitialization(): void {
    if (!this.isInitialized || !this.contract || !this.signer) {
      throw new Error('TribeContract service not initialized. Call initialize() first.');
    }
  }

  // Get the next tribe ID (total number of tribes)
  async getNextTribeId(): Promise<number> {
    try {
      this.checkInitialization();
      const nextId = await this.contract!.nextTribeId();
      return Number(nextId);
    } catch (error) {
      console.error('Failed to get next tribe ID:', error);
      throw error;
    }
  }

  // Get all tribes by iterating from 0 to nextTribeId - 1
  async getAllTribes(): Promise<TribeDetails[]> {
    try {
      this.checkInitialization();
      const nextId = await this.getNextTribeId();
      const tribes: TribeDetails[] = [];

      console.log(`Fetching tribes from 0 to ${nextId - 1}`);

      // Iterate through all existing tribe IDs (starting from 0)
      for (let i = 0; i < nextId; i++) {
        try {
          const exists = await this.getTribeExists(i);
          if (exists) {
            console.log(`Tribe ${i} exists, fetching details...`);
            
            // Get tribe details using getTribeDetails
            const details = await this.getTribeDetails(i);
            
            // Get member count using getMemberCount
            const memberCount = await this.getMemberCount(i);
            
            // Create enhanced tribe details with accurate member count
            const enhancedDetails: TribeDetails = {
              ...details,
              memberCount: Number(memberCount)
            };
            
            tribes.push(enhancedDetails);
            console.log(`Successfully fetched tribe ${i}: ${details.name} with ${memberCount} members`);
          } else {
            console.log(`Tribe ${i} does not exist, skipping...`);
          }
        } catch (error) {
          console.warn(`Failed to get details for tribe ${i}:`, error);
          // Continue with next tribe
        }
      }

      console.log(`Successfully fetched ${tribes.length} tribes`);
      return tribes;
    } catch (error) {
      console.error('Failed to get all tribes:', error);
      throw error;
    }
  }

  // Get tribes with membership status for a specific user
  async getTribesWithMembershipStatus(userAddress: string): Promise<Array<TribeDetails & { isMember: boolean; memberStatus: number }>> {
    try {
      this.checkInitialization();
      const tribes = await this.getAllTribes();
      const tribesWithStatus: Array<TribeDetails & { isMember: boolean; memberStatus: number }> = [];

      for (let i = 0; i < tribes.length; i++) {
        try {
          // Find the actual tribe ID by checking which tribe this is
          const tribeId = await this.findTribeIdByName(tribes[i].name);
          
          // Check if user is member using isMember
          const isMember = await this.isMember(tribeId, userAddress);
          
          // Get member status using getMemberStatus
          const memberStatus = await this.getMemberStatus(tribeId, userAddress);
          
          tribesWithStatus.push({
            ...tribes[i],
            isMember,
            memberStatus: Number(memberStatus)
          });
        } catch (error) {
          console.warn(`Failed to get membership status for tribe ${i}:`, error);
          // Add tribe without membership status
          tribesWithStatus.push({
            ...tribes[i],
            isMember: false,
            memberStatus: MemberStatusEnum.NONE
          });
        }
      }

      return tribesWithStatus;
    } catch (error) {
      console.error('Failed to get tribes with membership status:', error);
      throw error;
    }
  }

  // Helper function to find tribe ID by name
  private async findTribeIdByName(tribeName: string): Promise<number> {
    try {
      this.checkInitialization();
      const nextId = await this.getNextTribeId();
      
      for (let i = 0; i < nextId; i++) {
        try {
          const exists = await this.getTribeExists(i);
          if (exists) {
            const details = await this.getTribeDetails(i);
            if (details.name === tribeName) {
              return i;
            }
          }
        } catch (error) {
          continue;
        }
      }
      throw new Error(`Tribe with name "${tribeName}" not found`);
    } catch (error) {
      console.error('Failed to find tribe ID by name:', error);
      throw error;
    }
  }

  // Create a new tribe
  async createTribe(params: CreateTribeParams): Promise<CreateTribeResult> {
    try {
      this.checkInitialization();

      console.log('Creating tribe with params:', params);

      // Check if contract is operational
      const isOperational = await this.isContractOperational();
      if (!isOperational) {
        throw new Error('Contract is not operational. Please check your connection and try again.');
      }

      // Check if contract is paused
      const isPaused = await this.isContractPaused();
      if (isPaused) {
        throw new Error('Contract is currently paused. Tribe creation is temporarily disabled.');
      }

      // Verify contract exists and is accessible
      const contractVerification = await this.verifyContract();
      console.log('Contract verification:', contractVerification);
      
      if (!contractVerification.exists) {
        throw new Error(`Contract does not exist at address ${await this.contract!.getAddress()}. Please check the contract deployment.`);
      }

      // Test basic contract functions
      const basicFunctionTest = await this.testBasicContractFunctions();
      console.log('Basic function test:', basicFunctionTest);
      
      if (basicFunctionTest.errors.length > 0) {
        throw new Error(`Contract functions are not working properly:\n${basicFunctionTest.errors.join('\n')}`);
      }

      // Validate parameters
      if (!params.name || params.name.trim() === '') {
        throw new Error('Tribe name is required');
      }

      if (!params.metadata || params.metadata.trim() === '') {
        throw new Error('Tribe metadata is required');
      }

      if (!params.admins || params.admins.length === 0) {
        throw new Error('At least one admin is required');
      }

      // Validate admin addresses
      for (const admin of params.admins) {
        if (!ethers.isAddress(admin)) {
          throw new Error(`Invalid admin address: ${admin}`);
        }
      }

      // Validate joinType
      if (params.joinType < 0 || params.joinType > 6) {
        throw new Error(`Invalid join type: ${params.joinType}. Must be between 0-6`);
      }

      // Validate entryFee
      if (params.entryFee < 0) {
        throw new Error('Entry fee cannot be negative');
      }

      // Validate NFT requirements
      if (params.nftRequirements && params.nftRequirements.length > 0) {
        for (const req of params.nftRequirements) {
          if (!ethers.isAddress(req.nftContract)) {
            throw new Error(`Invalid NFT contract address: ${req.nftContract}`);
          }
          if (req.nftType < 0 || req.nftType > 2) {
            throw new Error(`Invalid NFT type: ${req.nftType}. Must be between 0-2`);
          }
        }
      }

      // // Ensure the signer is included in admins if not already
      // const signerAddress = await this.signer!.getAddress();
      // const adminsWithSigner = params.admins.includes(signerAddress) 
      //   ? params.admins 
      //   : [...params.admins, signerAddress];

      console.log('Validated parameters:', {
        name: params.name,
        metadata: params.metadata,
        admins: params?.admins,
        joinType: params.joinType,
        entryFee: params.entryFee,
        nftRequirements: params.nftRequirements
      });

            // Get current network and contract info for transaction
      const currentNetwork = await this.provider!.getNetwork();
      const contractAddress = await this.contract!.getAddress();
      const signerAddress = await this.signer!.getAddress();
      
      console.log("Creating tribe...");
      console.log("Signer address:", signerAddress);
      console.log("Contract address:", contractAddress);
      console.log("Network:", {
        chainId: currentNetwork.chainId.toString(),
        name: currentNetwork.name
      });
      
      // Get gas price
      const feeData = await this.provider!.getFeeData();
      console.log("Gas price:", feeData);

      // Call the createTribe function with validated parameters
      const tx = await this.contract!.createTribe(
        params.name,
        params.metadata,
        params.admins,
        params.joinType,
        params.entryFee,
        []
      );

      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Tribe created in block:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());

      // Get the tribe ID from the TribeCreated event
      const events = receipt?.logs?.map((log: any) => {
        try {
          return this.contract!.interface.parseLog(log);
        } catch {
          return null;
        }
      }).filter(Boolean);

      const tribeCreatedEvent = events?.find((event: any) => 
        event?.name === 'TribeCreated'
      );

      if (tribeCreatedEvent) {
        const tribeId = tribeCreatedEvent.args[0];
        console.log('Tribe created with ID:', tribeId.toString());
        return {
          tribeId: Number(tribeId),
          transactionHash: receipt?.hash || tx.hash
        };
      } else {
        throw new Error('TribeCreated event not found in transaction receipt');
      }
    } catch (error) {
      console.error('Failed to create tribe:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('execution reverted')) {
          const customError = await this.getCustomError(error);
          throw new Error(`Contract execution reverted: ${customError}\n\nPossible causes:\n1. Tribe name already exists\n2. Invalid admin address\n3. Contract is paused\n4. Invalid parameters\n\nOriginal error: ${error.message}`);
        }
        throw error;
      }
      throw new Error(`Unknown error occurred: ${error}`);
    }
  }

  // Test function to validate parameters before creating tribe
  async testCreateTribeParams(params: CreateTribeParams): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.checkInitialization();

      // Test contract connection
      try {
        await this.contract!.getNextTribeId();
      } catch (error) {
        errors.push('Contract is not accessible');
        return { isValid: false, errors, warnings };
      }

      // Validate name
      if (!params.name || params.name.trim() === '') {
        errors.push('Tribe name is required');
      } else if (params.name.length > 100) {
        errors.push('Tribe name is too long (max 100 characters)');
      }

      // Validate metadata
      if (!params.metadata || params.metadata.trim() === '') {
        errors.push('Tribe metadata is required');
      } else if (params.metadata.length > 10000) {
        errors.push('Metadata is too long (max 10000 characters)');
      }

      // Validate admins
      if (!params.admins || params.admins.length === 0) {
        errors.push('At least one admin is required');
      } else {
        for (const admin of params.admins) {
          if (!ethers.isAddress(admin)) {
            errors.push(`Invalid admin address: ${admin}`);
          }
        }
      }

      // Validate joinType
      if (params.joinType < 0 || params.joinType > 6) {
        errors.push(`Invalid join type: ${params.joinType}. Must be between 0-6`);
      }

      // Validate entryFee
      if (params.entryFee < 0) {
        errors.push('Entry fee cannot be negative');
      } else if (params.entryFee > ethers.parseEther('100')) {
        warnings.push('Entry fee is very high (> 100 ETH)');
      }

      // Validate NFT requirements
      if (params.nftRequirements && params.nftRequirements.length > 0) {
        for (const req of params.nftRequirements) {
          if (!ethers.isAddress(req.nftContract)) {
            errors.push(`Invalid NFT contract address: ${req.nftContract}`);
          }
          if (req.nftType < 0 || req.nftType > 2) {
            errors.push(`Invalid NFT type: ${req.nftType}. Must be between 0-2`);
          }
        }
      }

      // Check if tribe name already exists
      try {
        const nameExists = await this.checkTribeNameExists(params.name);
        if (nameExists) {
          errors.push(`Tribe name "${params.name}" already exists`);
        }
      } catch (error) {
        console.warn('Could not check tribe name existence:', error);
      }

      // Test if we can estimate gas (this will catch most contract-level issues)
      try {
        const gasEstimate = await this.contract!.createTribe.estimateGas(
          params.name,
          params.metadata,
          params.admins,
          params.joinType,
          params.entryFee,
          params.nftRequirements || []
        );
        console.log('Gas estimate for createTribe:', gasEstimate.toString());
      } catch (error) {
        const customError = await this.getCustomError(error);
        errors.push(`Gas estimation failed: ${customError}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Test creating a tribe with minimal parameters
  async testCreateMinimalTribe(): Promise<{
    success: boolean;
    error?: string;
    tribeId?: number;
  }> {
    try {
      this.checkInitialization();
      
      const userAddress = await this.signer!.getAddress();
      
      const testParams = {
        name: `TestTribe_${Date.now()}`, // Unique name
        metadata: JSON.stringify({
          description: 'Test tribe',
          category: 'test',
          isPrivate: false
        }),
        admins: [userAddress],
        joinType: 0, // Public
        entryFee: 0,
        nftRequirements: []
      };
      
      console.log('Testing minimal tribe creation with params:', testParams);
      
      const result = await this.createTribe(testParams);
      
      return {
        success: true,
        tribeId: result.tribeId
      };
    } catch (error) {
      const customError = await this.getCustomError(error);
      return {
        success: false,
        error: customError
      };
    }
  }

  // Example function to create a tribe with MetaMask
  async createTribeExample(): Promise<void> {
    try {
      console.log("=== Tribe Creation Example with MetaMask ===");
      
      // Initialize the service (this will request XDC network switch)
      await this.initialize();
      
      // Get user's address
      const userAddress = await this.signer!.getAddress();
      console.log("User address:", userAddress);
      
      // Example parameters
      const params = {
        name: "My Awesome Tribe",
        metadata: JSON.stringify({
          description: "A test tribe created via MetaMask",
          category: "test",
          isPrivate: false
        }),
        admins: [userAddress],
        joinType: 0, // Public
        entryFee: Number(ethers.parseEther("0")), // Free
        nftRequirements: []
      };
      
      console.log("Creating tribe with params:", params);
      
      // Create the tribe
      const result = await this.createTribe(params);
      
      console.log("Tribe created successfully!");
      console.log("Tribe ID:", result.tribeId);
      console.log("Transaction hash:", result.transactionHash);
      
    } catch (error) {
      console.error("Error creating tribe:", error instanceof Error ? error.message : 'Unknown error');
      console.error("Full error:", error);
    }
  }

  // Get tribe details using getTribeDetails
  async getTribeDetails(tribeId: number): Promise<TribeDetails> {
    try {
      this.checkInitialization();
      const response = await this.contract!.getTribeDetails(tribeId);
      
      console.log('Raw getTribeDetails response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response values:', Object.values(response));
      
      // Handle different response formats
      let transformedDetails: TribeDetails;
      
      if (Array.isArray(response)) {
        // If response is an array, use array indices
        transformedDetails = {
          name: response[0] || '',
          metadata: response[1] || '',
          admin: response[2] || '',
          whitelist: response[3] || [],
          joinType: Number(response[4]) || 0,
          entryFee: Number(response[5]) || 0,
          nftRequirements: response[6] || [],
          memberCount: Number(response[7]) || 0,
          canMerge: response[8] || false,
          isActive: response[9] || false,
          availableInviteCodes: response[10] || []
        };
      } else if (typeof response === 'object' && response !== null) {
        // If response is an object with numeric keys (indexed object)
        const keys = Object.keys(response).map(k => parseInt(k)).sort((a, b) => a - b);
        console.log('Sorted numeric keys:', keys);
        
        transformedDetails = {
          name: response[keys[0]] || '',
          metadata: response[keys[1]] || '',
          admin: response[keys[2]] || '',
          whitelist: response[keys[3]] || [],
          joinType: Number(response[keys[4]]) || 0,
          entryFee: Number(response[keys[5]]) || 0,
          nftRequirements: response[keys[6]] || [],
          memberCount: Number(response[keys[7]]) || 0,
          canMerge: response[keys[8]] || false,
          isActive: response[keys[9]] || false,
          availableInviteCodes: response[keys[10]] || []
        };
      } else {
        // Fallback for unexpected response format
        console.warn('Unexpected response format, using fallback');
        transformedDetails = {
          name: '',
          metadata: '',
          admin: '',
          whitelist: [],
          joinType: 0,
          entryFee: 0,
          nftRequirements: [],
          memberCount: 0,
          canMerge: false,
          isActive: false,
          availableInviteCodes: []
        };
      }
      
      console.log('Transformed tribe details:', transformedDetails);
      
      return transformedDetails;
    } catch (error) {
      console.error('Failed to get tribe details:', error);
      throw error;
    }
  }

  // Check if tribe exists
  async getTribeExists(tribeId: number): Promise<boolean> {
    try {
      this.checkInitialization();
      const exists = await this.contract!.getTribeExists(tribeId);
      return exists;
    } catch (error) {
      console.error('Failed to check if tribe exists:', error);
      throw error;
    }
  }

  // Get member count using getMemberCount
  async getMemberCount(tribeId: number): Promise<number> {
    try {
      this.checkInitialization();
      const count = await this.contract!.getMemberCount(tribeId);
      return Number(count);
    } catch (error) {
      console.error('Failed to get member count:', error);
      throw error;
    }
  }

  // Check if user is member using isMember
  async isMember(tribeId: number, memberAddress: string): Promise<boolean> {
    try {
      this.checkInitialization();
      const isMember = await this.contract!.isMember(tribeId, memberAddress);
      return isMember;
    } catch (error) {
      console.error('Failed to check if user is member:', error);
      throw error;
    }
  }

  // Get member status using getMemberStatus
  async getMemberStatus(tribeId: number, memberAddress: string): Promise<number> {
    try {
      this.checkInitialization();
      const status = await this.contract!.getMemberStatus(tribeId, memberAddress);
      return Number(status);
    } catch (error) {
      console.error('Failed to get member status:', error);
      throw error;
    }
  }

  // Get user's tribes
  async getUserTribes(userAddress: string): Promise<number[]> {
    try {
      this.checkInitialization();
      const tribeIds = await this.contract!.getUserTribes(userAddress);
      return tribeIds.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get user tribes:', error);
      throw error;
    }
  }

  // Join a tribe (for public tribes)
  async joinTribe(tribeId: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.joinTribe(tribeId);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to join tribe:', error);
      throw error;
    }
  }

  // Join tribe with invite code
  async joinTribeWithCode(tribeId: number, inviteCode: string): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.joinTribeWithCode(tribeId, inviteCode);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to join tribe with code:', error);
      throw error;
    }
  }

  // Request to join a tribe (for private tribes)
  async requestToJoinTribe(tribeId: number, entryFee?: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.requestToJoinTribe(tribeId, { value: entryFee || 0 });
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to request to join tribe:', error);
      throw error;
    }
  }

  // Update tribe using updateTribe function
  async updateTribe(tribeId: number, newMetadata: string, updatedWhitelist: string[]): Promise<string> {
    try {
      this.checkInitialization();
      console.log(`Updating tribe ${tribeId} with new metadata and whitelist`);
      
      const tx = await this.contract!.updateTribe(tribeId, newMetadata, updatedWhitelist);
      const receipt = await tx.wait();
      
      console.log(`Tribe ${tribeId} updated successfully`);
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to update tribe:', error);
      throw error;
    }
  }

  // Update tribe configuration
  async updateTribeConfig(
    tribeId: number, 
    joinType: number, 
    entryFee: number, 
    nftRequirements: NFTRequirement[]
  ): Promise<string> {
    try {
      this.checkInitialization();
      console.log(`Updating tribe ${tribeId} configuration`);
      
      const tx = await this.contract!.updateTribeConfig(tribeId, joinType, entryFee, nftRequirements);
      const receipt = await tx.wait();
      
      console.log(`Tribe ${tribeId} configuration updated successfully`);
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to update tribe config:', error);
      throw error;
    }
  }

  // Get tribe admin
  async getTribeAdmin(tribeId: number): Promise<string> {
    try {
      this.checkInitialization();
      const admin = await this.contract!.getTribeAdmin(tribeId);
      return admin;
    } catch (error) {
      console.error('Failed to get tribe admin:', error);
      throw error;
    }
  }

  // Get tribe config view
  async getTribeConfigView(tribeId: number): Promise<TribeConfigView> {
    try {
      this.checkInitialization();
      const config = await this.contract!.getTribeConfigView(tribeId);
      return config;
    } catch (error) {
      console.error('Failed to get tribe config view:', error);
      throw error;
    }
  }

  // Get tribe whitelist
  async getTribeWhitelist(tribeId: number): Promise<string[]> {
    try {
      this.checkInitialization();
      const whitelist = await this.contract!.getTribeWhitelist(tribeId);
      return whitelist;
    } catch (error) {
      console.error('Failed to get tribe whitelist:', error);
      throw error;
    }
  }

  // Check if address is whitelisted
  async isAddressWhitelisted(tribeId: number, userAddress: string): Promise<boolean> {
    try {
      this.checkInitialization();
      const isWhitelisted = await this.contract!.isAddressWhitelisted(tribeId, userAddress);
      return isWhitelisted;
    } catch (error) {
      console.error('Failed to check if address is whitelisted:', error);
      throw error;
    }
  }

  // Create invite code
  async createInviteCode(tribeId: number, code: string, maxUses: number, expiryTime: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.createInviteCode(tribeId, code, maxUses, expiryTime);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to create invite code:', error);
      throw error;
    }
  }

  // Get invite code status
  async getInviteCodeStatus(tribeId: number, code: string): Promise<{ valid: boolean; remainingUses: number }> {
    try {
      this.checkInitialization();
      const status = await this.contract!.getInviteCodeStatus(tribeId, code);
      return {
        valid: status.valid,
        remainingUses: Number(status.remainingUses)
      };
    } catch (error) {
      console.error('Failed to get invite code status:', error);
      throw error;
    }
  }

  // Revoke invite code
  async revokeInviteCode(tribeId: number, code: string): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.revokeInviteCode(tribeId, code);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to revoke invite code:', error);
      throw error;
    }
  }

  // Approve member
  async approveMember(tribeId: number, memberAddress: string): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.approveMember(tribeId, memberAddress);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to approve member:', error);
      throw error;
    }
  }

  // Reject member
  async rejectMember(tribeId: number, memberAddress: string): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.rejectMember(tribeId, memberAddress);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to reject member:', error);
      throw error;
    }
  }

  // Ban member
  async banMember(tribeId: number, memberAddress: string): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.banMember(tribeId, memberAddress);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to ban member:', error);
      throw error;
    }
  }

  // Request merge
  async requestMerge(sourceTribeId: number, targetTribeId: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.requestMerge(sourceTribeId, targetTribeId);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to request merge:', error);
      throw error;
    }
  }

  // Approve merge
  async approveMerge(mergeRequestId: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.approveMerge(mergeRequestId);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to approve merge:', error);
      throw error;
    }
  }

  // Cancel merge
  async cancelMerge(mergeRequestId: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.cancelMerge(mergeRequestId);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to cancel merge:', error);
      throw error;
    }
  }

  // Execute merge
  async executeMerge(mergeRequestId: number): Promise<string> {
    try {
      this.checkInitialization();
      const tx = await this.contract!.executeMerge(mergeRequestId);
      const receipt = await tx.wait();
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error('Failed to execute merge:', error);
      throw error;
    }
  }

  // Get merge request
  async getMergeRequest(requestId: number): Promise<any> {
    try {
      this.checkInitialization();
      const request = await this.contract!.getMergeRequest(requestId);
      return request;
    } catch (error) {
      console.error('Failed to get merge request:', error);
      throw error;
    }
  }

  // Get next merge request ID
  async getNextMergeRequestId(): Promise<number> {
    try {
      this.checkInitialization();
      const nextId = await this.contract!.nextMergeRequestId();
      return Number(nextId);
    } catch (error) {
      console.error('Failed to get next merge request ID:', error);
      throw error;
    }
  }

  // Get pending members using the new ABI function
  async getPendingMembers(tribeId: number): Promise<string[]> {
    try {
      this.checkInitialization();
      const pendingMembers = await this.contract!.getPendingMembers(tribeId);
      return pendingMembers;
    } catch (error) {
      console.error('Failed to get pending members:', error);
      throw error;
    }
  }

  // Get banned members using the new ABI function
  async getBannedMembers(tribeId: number): Promise<string[]> {
    try {
      this.checkInitialization();
      const bannedMembers = await this.contract!.getBannedMembers(tribeId);
      return bannedMembers;
    } catch (error) {
      console.error('Failed to get banned members:', error);
      throw error;
    }
  }

  // Get tribe member statistics
  async getTribeMemberStats(tribeId: number): Promise<{
    activeCount: number;
    pendingCount: number;
    bannedCount: number;
    totalProcessed: number;
  }> {
    try {
      this.checkInitialization();
      const stats = await this.contract!.getTribeMemberStats(tribeId);
      return {
        activeCount: Number(stats.activeCount),
        pendingCount: Number(stats.pendingCount),
        bannedCount: Number(stats.bannedCount),
        totalProcessed: Number(stats.totalProcessed)
      };
    } catch (error) {
      console.error('Failed to get tribe member stats:', error);
      throw error;
    }
  }

  // Get all active tribes
  async getAllActiveTribes(): Promise<number[]> {
    try {
      this.checkInitialization();
      const activeTribes = await this.contract!.getAllActiveTribes();
      return activeTribes.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get all active tribes:', error);
      throw error;
    }
  }

  // Get tribes by join type
  async getTribesByJoinType(joinType: number): Promise<number[]> {
    try {
      this.checkInitialization();
      const tribes = await this.contract!.getTribesByJoinType(joinType);
      return tribes.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get tribes by join type:', error);
      throw error;
    }
  }

  // Get user tribes with status
  async getUserTribesWithStatus(userAddress: string): Promise<{
    tribeIds: number[];
    statuses: number[];
  }> {
    try {
      this.checkInitialization();
      const result = await this.contract!.getUserTribesWithStatus(userAddress);
      return {
        tribeIds: result.tribeIds.map((id: any) => Number(id)),
        statuses: result.statuses.map((status: any) => Number(status))
      };
    } catch (error) {
      console.error('Failed to get user tribes with status:', error);
      throw error;
    }
  }

  // Check if user can join tribe
  async canUserJoinTribe(tribeId: number, userAddress: string): Promise<{
    canJoin: boolean;
    reason: string;
  }> {
    try {
      this.checkInitialization();
      const result = await this.contract!.canUserJoinTribe(tribeId, userAddress);
      return {
        canJoin: result.canJoin,
        reason: result.reason
      };
    } catch (error) {
      console.error('Failed to check if user can join tribe:', error);
      throw error;
    }
  }

  // Get tribe basic info
  async getTribeBasicInfo(tribeId: number): Promise<{
    name: string;
    admin: string;
    memberCount: number;
    isActive: boolean;
    joinType: number;
  }> {
    try {
      this.checkInitialization();
      const info = await this.contract!.getTribeBasicInfo(tribeId);
      return {
        name: info.name,
        admin: info.admin,
        memberCount: Number(info.memberCount),
        isActive: info.isActive,
        joinType: Number(info.joinType)
      };
    } catch (error) {
      console.error('Failed to get tribe basic info:', error);
      throw error;
    }
  }

  // Get total tribes count
  async getTotalTribes(): Promise<number> {
    try {
      this.checkInitialization();
      const total = await this.contract!.getTotalTribes();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total tribes:', error);
      throw error;
    }
  }

  // Get tribe members (active members only)
  async getTribeMembers(tribeId: number): Promise<string[]> {
    try {
      this.checkInitialization();
      const members = await this.contract!.getTribeMembers(tribeId);
      return members;
    } catch (error) {
      console.error('Failed to get tribe members:', error);
      throw error;
    }
  }

  // Check if contract is operational
  async isContractOperational(): Promise<boolean> {
    try {
      this.checkInitialization();
      
      // Try to get the next tribe ID to check if contract is responsive
      await this.contract!.getNextTribeId();
      return true;
    } catch (error) {
      console.error('Contract is not operational:', error);
      return false;
    }
  }

  // Verify contract exists and is accessible
  async verifyContract(): Promise<{
    exists: boolean;
    code: string;
    balance: string;
    error?: string;
  }> {
    try {
      this.checkInitialization();
      
      const contractAddress = await this.contract!.getAddress();
      
      // Check if contract has code
      const code = await this.provider!.getCode(contractAddress);
      
      // Check contract balance
      const balance = await this.provider!.getBalance(contractAddress);
      
      return {
        exists: code !== '0x',
        code: code,
        balance: balance.toString()
      };
    } catch (error) {
      return {
        exists: false,
        code: '0x',
        balance: '0',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get contract owner/admin (if available)
  async getContractOwner(): Promise<string | null> {
    try {
      this.checkInitialization();
      
      // Try to call owner() function if it exists
      const owner = await this.contract!.owner();
      return owner;
    } catch (error) {
      console.log('Owner function not available or contract not owned');
      return null;
    }
  }

  // Check if contract is paused
  async isContractPaused(): Promise<boolean> {
    try {
      this.checkInitialization();
      
      // Try to call paused() function if it exists
      const paused = await this.contract!.paused();
      return paused;
    } catch (error) {
      console.log('Paused function not available');
      return false;
    }
  }

  // Debug function to test contract functionality
  async debugContract(): Promise<{
    isConnected: boolean;
    networkConfig: any;
    contractAddress: string;
    signerAddress: string;
    nextTribeId: number;
    totalTribes: number;
    customErrors: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      this.checkInitialization();
      
      const contractAddress = await this.contract!.getAddress();
      const signerAddress = await this.signer!.getAddress();
      
      let nextTribeId = 0;
      let totalTribes = 0;
      const customErrors = this.getCustomErrors();
      const networkConfig = await this.getCurrentNetworkConfig();
      
      try {
        nextTribeId = await this.getNextTribeId();
      } catch (error) {
        errors.push(`Failed to get next tribe ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      try {
        totalTribes = await this.getTotalTribes();
      } catch (error) {
        errors.push(`Failed to get total tribes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return {
        isConnected: true,
        networkConfig,
        contractAddress,
        signerAddress,
        nextTribeId,
        totalTribes,
        customErrors,
        errors
      };
    } catch (error) {
      errors.push(`Contract initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isConnected: false,
        networkConfig: null,
        contractAddress: '',
        signerAddress: '',
        nextTribeId: 0,
        totalTribes: 0,
        customErrors: [],
        errors
      };
    }
  }

  // Test basic contract functions
  async testBasicContractFunctions(): Promise<{
    nextTribeId: boolean;
    totalTribes: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      this.checkInitialization();
      
      // Test getNextTribeId
      try {
        await this.contract!.getNextTribeId();
        console.log('✓ getNextTribeId function works');
      } catch (error) {
        errors.push(`getNextTribeId failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Test getTotalTribes
      try {
        await this.contract!.getTotalTribes();
        console.log('✓ getTotalTribes function works');
      } catch (error) {
        errors.push(`getTotalTribes failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return {
        nextTribeId: errors.filter(e => e.includes('getNextTribeId')).length === 0,
        totalTribes: errors.filter(e => e.includes('getTotalTribes')).length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Contract test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        nextTribeId: false,
        totalTribes: false,
        errors
      };
    }
  }

  // Check if ABI matches deployed contract
  async checkABIMatch(): Promise<{
    matches: boolean;
    supportedFunctions: string[];
    missingFunctions: string[];
    errors: string[];
  }> {
    const supportedFunctions: string[] = [];
    const missingFunctions: string[] = [];
    const errors: string[] = [];
    
    try {
      this.checkInitialization();
      
      // Test key functions from the ABI
      const testFunctions = [
        'getNextTribeId',
        'getTotalTribes',
        'getTribeExists',
        'getMemberCount',
        'isMember',
        'getMemberStatus',
        'getUserTribes',
        'getTribeDetails',
        'getTribeAdmin',
        'getTribeConfigView',
        'getTribeWhitelist',
        'isAddressWhitelisted',
        'getInviteCodeStatus',
        'getPendingMembers',
        'getBannedMembers',
        'getTribeMemberStats',
        'getAllActiveTribes',
        'getTribesByJoinType',
        'getUserTribesWithStatus',
        'canUserJoinTribe',
        'getTribeBasicInfo',
        'getTribeMembers',
        'getMergeRequest',
        'getNextMergeRequestId'
      ];
      
      for (const funcName of testFunctions) {
        try {
          if (this.contract![funcName]) {
            // Try to call the function (for view functions)
            if (funcName.startsWith('get') || funcName.startsWith('is') || funcName.startsWith('can')) {
              try {
                await this.contract![funcName]();
                supportedFunctions.push(funcName);
              } catch (error) {
                // Function exists but might need parameters
                supportedFunctions.push(funcName);
              }
            } else {
              supportedFunctions.push(funcName);
            }
          } else {
            missingFunctions.push(funcName);
          }
        } catch (error) {
          missingFunctions.push(funcName);
          errors.push(`${funcName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return {
        matches: missingFunctions.length === 0,
        supportedFunctions,
        missingFunctions,
        errors
      };
    } catch (error) {
      errors.push(`ABI check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        matches: false,
        supportedFunctions,
        missingFunctions,
        errors
      };
    }
  }

  // Check if tribe name already exists
  async checkTribeNameExists(tribeName: string): Promise<boolean> {
    try {
      this.checkInitialization();
      
      // Get all tribes and check if name exists
      const totalTribes = await this.getTotalTribes();
      
      for (let i = 0; i < totalTribes; i++) {
        try {
          const tribeDetails = await this.getTribeDetails(i);
          if (tribeDetails.name.toLowerCase() === tribeName.toLowerCase()) {
            return true;
          }
        } catch (error) {
          // Skip tribes that don't exist or can't be accessed
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check tribe name existence:', error);
      return false; // Assume it doesn't exist if we can't check
    }
  }

  // Get custom error from contract
  private async getCustomError(error: any): Promise<string> {
    try {
      if (error?.data) {
        // Try to decode the custom error
        const errorData = error.data;
        
        // Common custom error selectors
        const errorSelectors = {
          '0xe2517d3f': 'TribeNameAlreadyExists or DuplicateTribe',
          '0x4e487b71': 'PanicError', // Standard panic error
          '0x8456cb59': 'ContractPaused',
          '0x796d4371': 'InvalidJoinType',
          '0x8f4eb604': 'InvalidEntryFee',
          '0x5cd83192': 'InvalidMetadata',
          '0x08c379a0': 'StringError' // Standard string error
        };
        
        const errorSelector = errorData.substring(0, 10);
        const knownError = errorSelectors[errorSelector as keyof typeof errorSelectors];
        
        if (knownError) {
          return `Contract Error: ${knownError}`;
        }
        
        // Try to decode as a string error
        if (errorSelector === '0x08c379a0') {
          try {
            const decodedError = this.contract!.interface.parseError(errorData);
            return `Contract Error: ${decodedError?.name || 'Unknown string error'}`;
          } catch (decodeError) {
            return `Contract Error: String error (failed to decode)`;
          }
        }
        
        // Try to decode as a custom error using the contract interface
        try {
          const decodedError = this.contract!.interface.parseError(errorData);
          return `Contract Error: ${decodedError?.name || 'Unknown custom error'}`;
        } catch (decodeError) {
          return `Contract Error: Unknown custom error (${errorSelector})`;
        }
      }
      
      return 'Unknown contract error';
    } catch (decodeError) {
      return 'Failed to decode contract error';
    }
  }

  // Get custom errors from contract ABI
  getCustomErrors(): string[] {
    try {
      const errors: string[] = [];
      
      // Check if the contract ABI has custom errors defined
      if (this.contract?.interface) {
        const abi = this.contract.interface.format();
        
        // Look for custom error definitions in the ABI
        // This is a simplified approach - in a real implementation, you'd parse the ABI more carefully
        if (Array.isArray(abi)) {
          abi.forEach((item: any) => {
            if (item.type === 'error') {
              errors.push(item.name);
            }
          });
        }
      }
      
      return errors;
    } catch (error) {
      console.error('Failed to get custom errors:', error);
      return [];
    }
  }

  // Get current network configuration
  async getCurrentNetworkConfig(): Promise<{
    networkKey: string;
    chainId: number;
    networkConfig: any;
    contractAddress: string;
  } | null> {
    try {
      this.checkInitialization();
      
      const network = await this.provider!.getNetwork();
      const chainId = Number(network.chainId);
      
      // Since we're using XDC specifically
      if (chainId !== networksConfig.xdc.chainId) {
        return null;
      }
      
      const networkConfig = networksConfig.xdc;
      const contractAddress = contractsConfig.xdc.TribeController;
      
      return {
        networkKey: 'xdc',
        chainId,
        networkConfig,
        contractAddress
      };
    } catch (error) {
      console.error('Failed to get current network config:', error);
      return null;
    }
  }
}

// Export singleton instance
export const tribeContractService = new TribeContractService();
