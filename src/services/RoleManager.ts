import { ethers } from 'ethers';
import RoleManagerABI from '../abis/RoleManager.json';
import { networksConfig } from '../config/networks.config';
import { contractsConfig } from '../config/contracts.config';

export interface UserRoles {
  hasArtistRole: boolean;
  hasBrandRole: boolean;
  hasFanRole: boolean;
  hasModeratorRole: boolean;
  hasOrganizerRole: boolean;
  hasPollCreatorRole: boolean;
  hasPostCreatorRole: boolean;
  hasProposalCreatorRole: boolean;
  hasQuizCreatorRole: boolean;
  hasFanAssignerRole: boolean;
}

// Role constants from the smart contract
export const ROLE_CONSTANTS = {
  ARTIST_ROLE: '0x877a78dc988c0ec5f58453b44888a55eb39755c3d5ed8d8ea990912aa3ef29c6',
  BRAND_ROLE: '0x232aaa91097cd1c424674d9a7a8ed253faf3509deccbed30156c58261e376254',
  FAN_ROLE: '0x71f3d55856e4058ed06ee057d79ada615f65cdf5f9ee88181b914225088f834f',
  MODERATOR_ROLE: '0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63',
  ORGANIZER_ROLE: '0xdd057e4f7b238d4c4e39da618fb49ffe6165996f3b117d2d6c2f5fa5f14a185c',
  POLL_CREATOR_ROLE: '0xd52b9622fe3ce468afb95246111fe2ff28de74ab22e427623dca2ad2172e5f59',
  POST_CREATOR_ROLE: '0x399bc110c7610ecddc22e1dcd4f4a685dbc611344debc29d83653480ba14783a',
  PROPOSAL_CREATOR_ROLE: '0xf903ac88d99e2ad0554114b9feb3f1669705fc1aec87b3b5349651bb7da32b6e',
  QUIZ_CREATOR_ROLE: '0x8a21e8fdae6c23863f7de5307e2e7162c88dab602a41610addb5f1505d25939',
  FAN_ASSIGNER_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000' // This needs to be updated with actual value
};

class RoleManagerService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get the current network
      const network = await this.provider.getNetwork();
      
      // Find the network config by chainId
      const networkConfig = Object.values(networksConfig).find(
        config => config.chainId === Number(network.chainId)
      );

      if (!networkConfig) {
        throw new Error(`Unsupported network: ${network.chainId}`);
      }

      // Get the correct contract address from contractsConfig
      const contractAddress = contractsConfig.xdc.RoleManager;

      // Initialize contract
      this.contract = new ethers.Contract(
        contractAddress,
        RoleManagerABI.abi,
        this.signer
      );

      console.log('Role manager service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize role manager service:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.contract || !this.signer) {
      throw new Error('Role manager service not initialized. Call initialize() first.');
    }
  }

  // Check if user has a specific role using the correct hasRole function
  async hasRole(roleAddress: string, userAddress: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract!.hasRole(roleAddress, userAddress);
    } catch (error) {
      console.error('Failed to check role:', error);
      return false;
    }
  }

  // Check if user has any of the specified roles
  async hasAnyRole(userAddress: string, roles: string[]): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract!.hasAnyRole(userAddress, roles);
    } catch (error) {
      console.error('Failed to check any role:', error);
      return false;
    }
  }

  // Check if user has all of the specified roles
  async hasAllRoles(userAddress: string, roles: string[]): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract!.hasAllRoles(userAddress, roles);
    } catch (error) {
      console.error('Failed to check all roles:', error);
      return false;
    }
  }

  // Get all roles for a user
  async getUserRoles(userAddress: string): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getUserRoles(userAddress);
    } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
    }
  }

  // Get user roles in a structured format using the correct hasRole function
  async getUserRolesStructured(userAddress: string): Promise<UserRoles> {
    try {
      const [
        hasArtistRole,
        hasBrandRole,
        hasFanRole,
        hasModeratorRole,
        hasOrganizerRole,
        hasPollCreatorRole,
        hasPostCreatorRole,
        hasProposalCreatorRole,
        hasQuizCreatorRole,
        hasFanAssignerRole
      ] = await Promise.all([
        this.hasRole(ROLE_CONSTANTS.ARTIST_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.BRAND_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.FAN_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.MODERATOR_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.ORGANIZER_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.POLL_CREATOR_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.POST_CREATOR_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.PROPOSAL_CREATOR_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.QUIZ_CREATOR_ROLE, userAddress),
        this.hasRole(ROLE_CONSTANTS.FAN_ASSIGNER_ROLE, userAddress)
      ]);

      return {
        hasArtistRole,
        hasBrandRole,
        hasFanRole,
        hasModeratorRole,
        hasOrganizerRole,
        hasPollCreatorRole,
        hasPostCreatorRole,
        hasProposalCreatorRole,
        hasQuizCreatorRole,
        hasFanAssignerRole
      };
    } catch (error) {
      console.error('Failed to get structured user roles:', error);
      return {
        hasArtistRole: false,
        hasBrandRole: false,
        hasFanRole: false,
        hasModeratorRole: false,
        hasOrganizerRole: false,
        hasPollCreatorRole: false,
        hasPostCreatorRole: false,
        hasProposalCreatorRole: false,
        hasQuizCreatorRole: false,
        hasFanAssignerRole: false
      };
    }
  }

  // Check specifically if user is an organizer
  async isOrganizer(userAddress: string): Promise<boolean> {
    return await this.hasRole(ROLE_CONSTANTS.ORGANIZER_ROLE, userAddress);
  }

  // Check specifically if user is a fan
  async isFan(userAddress: string): Promise<boolean> {
    return await this.hasRole(ROLE_CONSTANTS.FAN_ROLE, userAddress);
  }

  // Check specifically if user is an artist
  async isArtist(userAddress: string): Promise<boolean> {
    return await this.hasRole(ROLE_CONSTANTS.ARTIST_ROLE, userAddress);
  }

  // Check specifically if user is a brand
  async isBrand(userAddress: string): Promise<boolean> {
    return await this.hasRole(ROLE_CONSTANTS.BRAND_ROLE, userAddress);
  }

  // Check specifically if user is a moderator
  async isModerator(userAddress: string): Promise<boolean> {
    return await this.hasRole(ROLE_CONSTANTS.MODERATOR_ROLE, userAddress);
  }

  // Grant a role to a user (only admin can do this)
  async grantRole(role: string, userAddress: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.grantRole(role, userAddress);
      await tx.wait();
    } catch (error) {
      console.error('Failed to grant role:', error);
      throw error;
    }
  }

  // Revoke a role from a user (only admin can do this)
  async revokeRole(role: string, userAddress: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.revokeRole(role, userAddress);
      await tx.wait();
    } catch (error) {
      console.error('Failed to revoke role:', error);
      throw error;
    }
  }

  // Assign a role to a user (using assignRole function)
  async assignRole(userAddress: string, role: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.assignRole(userAddress, role);
      await tx.wait();
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }

  // Remove a role from a user (using removeRole function)
  async removeRole(userAddress: string, role: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.removeRole(userAddress, role);
      await tx.wait();
    } catch (error) {
      console.error('Failed to remove role:', error);
      throw error;
    }
  }

  // Assign fan role to a user
  async assignFanRole(userAddress: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.assignFanRole(userAddress);
      await tx.wait();
    } catch (error) {
      console.error('Failed to assign fan role:', error);
      throw error;
    }
  }

  // Authorize a fan assigner
  async authorizeFanAssigner(assignerAddress: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.authorizeFanAssigner(assignerAddress);
      await tx.wait();
    } catch (error) {
      console.error('Failed to authorize fan assigner:', error);
      throw error;
    }
  }

  // Renounce a role (user can renounce their own role)
  async renounceRole(role: string): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.renounceRole(role, await this.signer!.getAddress());
      await tx.wait();
    } catch (error) {
      console.error('Failed to renounce role:', error);
      throw error;
    }
  }

  // Get role admin
  async getRoleAdmin(role: string): Promise<string> {
    this.ensureInitialized();

    try {
      return await this.contract!.getRoleAdmin(role);
    } catch (error) {
      console.error('Failed to get role admin:', error);
      throw error;
    }
  }

  // Check if contract supports interface
  async supportsInterface(interfaceId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract!.supportsInterface(interfaceId);
    } catch (error) {
      console.error('Failed to check interface support:', error);
      return false;
    }
  }
}

export const roleManagerService = new RoleManagerService(); 