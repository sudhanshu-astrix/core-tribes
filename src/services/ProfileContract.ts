import { ethers } from 'ethers';
import { contractsConfig } from '../config/contracts.config';
import ProfileNFTMinterABI from '../abis/ProfileNFTMinter.json';
import { useWalletStore } from '../store/walletStore';

// Contract interface types
export interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  bannerImage: string;
  socialLinks: {
    github: string;
    twitter: string;
    linkedin: string;
    website: string;
    instagram: string;
    youtube: string;
  };
}

export interface ProfileMetadata {
  username: string;
  metadataURI: string;
  owner: string;
}

export interface CreateProfileParams {
  username: string;
  metadataURI: string;
}

export interface CreateProfileResult {
  tokenId: number;
  transactionHash: string;
}

export interface UpdateProfileParams {
  tokenId: number;
  newMetadataURI: string;
}

export interface UpdateProfileResult {
  transactionHash: string;
}

class ProfileContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  // Initialize the contract connection
  async initialize() {
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get the current network
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Get contract address for current network
      const networkName = this.getNetworkName(chainId);
      const contractAddress = contractsConfig[networkName]?.ProfileNFTMinter;

      if (!contractAddress) {
        throw new Error(`ProfileNFTMinter contract not deployed on network ${networkName} (chainId: ${chainId})`);
      }

      // Create contract instance
      this.contract = new ethers.Contract(
        contractAddress,
        ProfileNFTMinterABI.abi,
        this.signer
      );

      console.log('ProfileContract initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize ProfileContract:', error);
      throw error;
    }
  }

  // Get network name from chainId
  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 50: // XDC Mainnet
        return 'xdc';
      case 51: // XDC Testnet
        return 'xdc-testnet';
      case 1: // Ethereum Mainnet
        return 'ethereum';
      case 137: // Polygon
        return 'polygon';
      case 56: // BSC
        return 'bsc';
      default:
        return 'xdc'; // Default to XDC
    }
  }

  // Check if contract is initialized
  private checkInitialization() {
    if (!this.contract || !this.provider || !this.signer) {
      throw new Error('ProfileContract not initialized. Call initialize() first.');
    }
  }

  // Create a new profile
  async createProfile(params: CreateProfileParams): Promise<CreateProfileResult> {
    try {
      this.checkInitialization();

      console.log('Creating profile with params:', params);

      // Call the createProfile function
      const tx = await this.contract!.createProfile(
        params.username,
        params.metadataURI
      );

      console.log('Profile creation transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Profile creation confirmed:', receipt);

      // Get the token ID from the ProfileCreated event
      const events = receipt?.logs?.map((log: any) => {
        try {
          return this.contract!.interface.parseLog(log);
        } catch {
          return null;
        }
      }).filter(Boolean);

      const profileCreatedEvent = events?.find((event: any) => 
        event?.name === 'ProfileCreated'
      );

      if (profileCreatedEvent) {
        const tokenId = profileCreatedEvent.args[0];
        console.log('Profile created with token ID:', tokenId.toString());
        return {
          tokenId: Number(tokenId),
          transactionHash: receipt?.hash || tx.hash
        };
      } else {
        throw new Error('ProfileCreated event not found in transaction receipt');
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  // Update profile metadata
  async updateProfileMetadata(params: UpdateProfileParams): Promise<UpdateProfileResult> {
    try {
      this.checkInitialization();

      console.log('Updating profile metadata with params:', params);

      // Call the updateProfileMetadata function
      const tx = await this.contract!.updateProfileMetadata(
        params.tokenId,
        params.newMetadataURI
      );

      console.log('Profile update transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Profile update confirmed:', receipt);

      return {
        transactionHash: receipt?.hash || tx.hash
      };
    } catch (error) {
      console.error('Failed to update profile metadata:', error);
      throw error;
    }
  }

  // Get profile by token ID
  async getProfileByTokenId(tokenId: number): Promise<ProfileMetadata> {
    try {
      this.checkInitialization();

      console.log('Getting profile for token ID:', tokenId);

      const profile = await this.contract!.getProfileByTokenId(tokenId);
      
      return {
        username: profile[0],
        metadataURI: profile[1],
        owner: profile[2]
      };
    } catch (error) {
      console.error('Failed to get profile by token ID:', error);
      throw error;
    }
  }

  // Get token ID by username
  async getTokenIdByUsername(username: string): Promise<number> {
    try {
      this.checkInitialization();

      console.log('Getting token ID for username:', username);

      const tokenId = await this.contract!.getTokenIdByUsername(username);
      return Number(tokenId);
    } catch (error) {
      console.error('Failed to get token ID by username:', error);
      throw error;
    }
  }

  // Check if username exists
  async usernameExists(username: string): Promise<boolean> {
    try {
      this.checkInitialization();

      console.log('Checking if username exists:', username);

      const exists = await this.contract!.usernameExists(username);
      console.log(`exists username ${username}`, exists);
      return exists;
    } catch (error) {
      console.error('Failed to check username existence:', error);
      throw error;
    }
  }

  // Get profile owner by token ID
  async ownerOf(tokenId: number): Promise<string> {
    try {
      this.checkInitialization();

      console.log('Getting owner for token ID:', tokenId);

      const owner = await this.contract!.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error('Failed to get profile owner:', error);
      throw error;
    }
  }

  // Get balance of profiles for an address
  async balanceOf(address: string): Promise<number> {
    try {
      this.checkInitialization();

      console.log('Getting profile balance for address:', address);

      const balance = await this.contract!.balanceOf(address);
      return Number(balance);
    } catch (error) {
      console.error('Failed to get profile balance:', error);
      throw error;
    }
  }

  // Get token URI for a token ID
  async tokenURI(tokenId: number): Promise<string> {
    try {
      this.checkInitialization();

      console.log('Getting token URI for token ID:', tokenId);

      const uri = await this.contract!.tokenURI(tokenId);
      return uri;
    } catch (error) {
      console.error('Failed to get token URI:', error);
      throw error;
    }
  }

  // Get contract name
  async name(): Promise<string> {
    try {
      this.checkInitialization();
      return await this.contract!.name();
    } catch (error) {
      console.error('Failed to get contract name:', error);
      throw error;
    }
  }

  // Get contract symbol
  async symbol(): Promise<string> {
    try {
      this.checkInitialization();
      return await this.contract!.symbol();
    } catch (error) {
      console.error('Failed to get contract symbol:', error);
      throw error;
    }
  }

  // Get contract owner
  async owner(): Promise<string> {
    try {
      this.checkInitialization();
      return await this.contract!.owner();
    } catch (error) {
      console.error('Failed to get contract owner:', error);
      throw error;
    }
  }

  // Get role manager address
  async roleManager(): Promise<string> {
    try {
      this.checkInitialization();
      return await this.contract!.roleManager();
    } catch (error) {
      console.error('Failed to get role manager:', error);
      throw error;
    }
  }

  // Helper method to check if user has a profile
  async hasProfile(address: string): Promise<boolean> {
    try {
      const balance = await this.balanceOf(address);
      return balance > 0;
    } catch (error) {
      console.error('Failed to check if user has profile:', error);
      return false;
    }
  }

  // Helper method to get user's profile token ID
  async getUserProfileTokenId(address: string): Promise<number | null> {
    try {
      const balance = await this.balanceOf(address);
      if (balance === 0) {
        return null;
      }

      // For simplicity, assuming users have only one profile
      // In a real implementation, you might need to track which token ID belongs to the user
      // This is a simplified approach
      return 0; // You might need to implement a mapping to track user's token ID
    } catch (error) {
      console.error('Failed to get user profile token ID:', error);
      return null;
    }
  }

  // Helper method to get user's profile data
  async getUserProfile(address: string): Promise<ProfileMetadata | null> {
    try {
      const tokenId = await this.getUserProfileTokenId(address);
      if (tokenId === null) {
        return null;
      }

      return await this.getProfileByTokenId(tokenId);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Disconnect and cleanup
  disconnect() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    console.log('ProfileContract disconnected');
  }
}

// Create a singleton instance
export const profileContractService = new ProfileContractService();

// Export the service instance and types
export default profileContractService; 