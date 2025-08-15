import { ethers } from 'ethers';
import VotingABI from '../abis/Voting.json';
import { contractsConfig } from '../config/contracts.config';
import { networksConfig } from '../config/networks.config';

export interface ProposalInfo {
  tribeId: number;
  creator: string;
  title: string;
  description: string;
  forVotes: number;
  againstVotes: number;
  startTime: number;
  endTime: number;
  status: ProposalStatus;
}

export enum ProposalStatus {
  ACTIVE = 0,
  PASSED = 1,
  REJECTED = 2,
  CANCELED = 3
}

export interface ProposalWithId extends ProposalInfo {
  proposalId: number;
}

class VotingService {
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
      const contractAddress = contractsConfig.xdc.Voting;

      // Initialize contract
      this.contract = new ethers.Contract(
        contractAddress,
        VotingABI.abi,
        this.signer
      );

      console.log('Voting service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize voting service:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.contract || !this.signer) {
      throw new Error('Voting service not initialized. Call initialize() first.');
    }
  }

  // Create a new proposal
  async createProposal(
    tribeId: number,
    title: string,
    description: string,
    votingPeriod: number
  ): Promise<number> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.createProposal(
        tribeId,
        title,
        description,
        votingPeriod
      );

      const receipt = await tx.wait();
      
      // Find the ProposalCreated event
      const proposalCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });

      if (proposalCreatedEvent) {
        const parsedLog = this.contract!.interface.parseLog(proposalCreatedEvent);
        if (parsedLog) {
          return parsedLog.args.proposalId;
        }
      }
      
      throw new Error('ProposalCreated event not found in transaction receipt');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    }
  }

  // Vote on a proposal
  async vote(proposalId: number, support: boolean): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.vote(proposalId, support);
      await tx.wait();
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  }

  // Execute a proposal
  async executeProposal(proposalId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.executeProposal(proposalId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      throw error;
    }
  }

  // Cancel a proposal
  async cancelProposal(proposalId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.cancelProposal(proposalId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to cancel proposal:', error);
      throw error;
    }
  }

  // Get proposal information
  async getProposalInfo(proposalId: number): Promise<ProposalInfo> {
    this.ensureInitialized();

    try {
      const proposal = await this.contract!.getProposalInfo(proposalId);
      return {
        tribeId: Number(proposal.tribeId),
        creator: proposal.creator,
        title: proposal.title,
        description: proposal.description,
        forVotes: Number(proposal.forVotes),
        againstVotes: Number(proposal.againstVotes),
        startTime: Number(proposal.startTime),
        endTime: Number(proposal.endTime),
        status: Number(proposal.status) as ProposalStatus
      };
    } catch (error) {
      console.error('Failed to get proposal info:', error);
      throw error;
    }
  }

  // Check if user has voted
  async hasVoted(proposalId: number, voter: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      return await this.contract!.hasVoted(proposalId, voter);
    } catch (error) {
      console.error('Failed to check if user has voted:', error);
      return false;
    }
  }

  // Get proposal voters
  async getProposalVoters(proposalId: number): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getProposalVoters(proposalId);
    } catch (error) {
      console.error('Failed to get proposal voters:', error);
      return [];
    }
  }

  // Get proposals by tribe with pagination
  async getProposalsByTribe(tribeId: number, offset: number, limit: number): Promise<{ proposalIds: number[], total: number }> {
    this.ensureInitialized();

    try {
      const result = await this.contract!.getProposalsByTribe(tribeId, offset, limit);
      return {
        proposalIds: result.proposalIds.map((id: any) => Number(id)),
        total: Number(result.total)
      };
    } catch (error) {
      console.error('Failed to get proposals by tribe:', error);
      return { proposalIds: [], total: 0 };
    }
  }

  // Get proposal count by tribe
  async getProposalCountByTribe(tribeId: number): Promise<number> {
    this.ensureInitialized();

    try {
      const count = await this.contract!.getProposalCountByTribe(tribeId);
      return Number(count);
    } catch (error) {
      console.error('Failed to get proposal count by tribe:', error);
      return 0;
    }
  }

  // Get proposal status as string
  async getProposalStatusString(proposalId: number): Promise<string> {
    this.ensureInitialized();

    try {
      return await this.contract!.getProposalStatusString(proposalId);
    } catch (error) {
      console.error('Failed to get proposal status string:', error);
      return 'UNKNOWN';
    }
  }

  // Get all proposals with pagination
  async getAllProposals(offset: number, limit: number): Promise<{ proposalIds: number[], total: number }> {
    this.ensureInitialized();

    try {
      const result = await this.contract!.getAllProposals(offset, limit);
      return {
        proposalIds: result.proposalIds.map((id: any) => Number(id)),
        total: Number(result.total)
      };
    } catch (error) {
      console.error('Failed to get all proposals:', error);
      return { proposalIds: [], total: 0 };
    }
  }

  // Get next proposal ID
  async getNextProposalId(): Promise<number> {
    this.ensureInitialized();

    try {
      const nextId = await this.contract!.nextProposalId();
      return Number(nextId);
    } catch (error) {
      console.error('Failed to get next proposal ID:', error);
      return 0;
    }
  }

  // Helper function to get proposal with ID
  async getProposalWithId(proposalId: number): Promise<ProposalWithId | null> {
    try {
      const proposalInfo = await this.getProposalInfo(proposalId);
      return {
        proposalId,
        ...proposalInfo
      };
    } catch (error) {
      console.error('Failed to get proposal with ID:', error);
      return null;
    }
  }

  // Helper function to get all proposals for a tribe with details
  async getProposalsWithDetails(tribeId: number, offset: number = 0, limit: number = 20): Promise<ProposalWithId[]> {
    try {
      const { proposalIds } = await this.getProposalsByTribe(tribeId, offset, limit);
      const proposals = await Promise.all(
        proposalIds.map(async (id) => {
          try {
            return await this.getProposalWithId(id);
          } catch (error) {
            console.warn(`Failed to get details for proposal ${id}:`, error);
            return null;
          }
        })
      );
      
      return proposals.filter((proposal): proposal is ProposalWithId => proposal !== null);
    } catch (error) {
      console.error('Failed to get proposals with details:', error);
      return [];
    }
  }
}

export const votingService = new VotingService(); 