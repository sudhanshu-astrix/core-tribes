import { ethers } from 'ethers';
import EventTicketsABI from '../abis/EventTickets.json';
import { networksConfig } from '../config/networks.config';

// Types for event management
export interface EventMetadata {
  title: string;
  description: string;
  date: string; // ISO string
  time: string; // ISO string
  location: string;
  image: string;
  category: string;
  maxCapacity: number;
  startTime: string; // ISO string for event start
  endTime: string; // ISO string for event end
}

export interface EventDetails {
  eventId: number;
  metadata: EventMetadata;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: string;
  active: boolean;
  isPrivate: boolean;
  tribeId: number;
  tribeName: string;
  ticketHolders: string[];
  totalTicketHolders: number;
}

export interface TicketRequest {
  requester: string;
  amount: number;
}

export interface EventCapacityInfo {
  maxTickets: number;
  ticketsSold: number;
  remainingTickets: number;
  capacityPercentage: number;
}

export interface OrganizerStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: string;
}

export interface TribeEventStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: string;
}

export interface SystemStats {
  totalTribes: number;
  totalEvents: number;
  totalActiveEvents: number;
  totalTicketsSold: number;
}

export class EventTicketsService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    const xdcConfig = networksConfig.xdc;
    this.contractAddress = xdcConfig.eventTicketsAddress;
  }

  async initialize(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and connect your wallet.');
      }

      const xdcConfig = networksConfig.xdc;
      await this.requestXDCNetwork();

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        EventTicketsABI.abi,
        this.signer
      );

      console.log('EventTicketsService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EventTicketsService:', error);
      throw error;
    }
  }

  private async requestXDCNetwork(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available');
      }

      const xdcConfig = networksConfig.xdc;
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== `0x${xdcConfig.chainId.toString(16)}`) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${xdcConfig.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${xdcConfig.chainId.toString(16)}`,
                  chainName: 'XDC Network',
                  nativeCurrency: xdcConfig.nativeCurrency,
                  rpcUrls: [xdcConfig.rpcUrl],
                  blockExplorerUrls: [xdcConfig.blockExplorerUrl],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      } else {
        console.log('Already connected to XDC network');
      }
    } catch (error) {
      console.error('Failed to switch to XDC network:', error);
      throw error;
    }
  }

  // Event Creation
  async createEvent(
    tribeId: number,
    metadata: EventMetadata,
    maxTickets: number,
    price: string, // in wei
    isPrivate: boolean
  ): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const metadataURI = JSON.stringify(metadata);
      const priceInWei = ethers.parseEther(price);

      console.log('Creating event with params:', {
        tribeId,
        metadataURI,
        maxTickets,
        price: priceInWei.toString(),
        isPrivate
      });

      const tx = await this.contract.createEvent(
        tribeId,
        metadataURI,
        maxTickets,
        priceInWei,
        isPrivate
      );

      const receipt = await tx.wait();
      console.log('Event created successfully:', receipt);

      // Get the event ID from the EventCreated event
      const eventCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'EventCreated';
        } catch {
          return false;
        }
      });

      if (eventCreatedEvent) {
        const parsed = this.contract!.interface.parseLog(eventCreatedEvent);
        return parsed!.args[0]; // eventId
      }

      throw new Error('Event created but could not retrieve event ID');
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  // Event Updates
  async cancelEvent(eventId: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.cancelEvent(eventId);
      await tx.wait();
      console.log('Event cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel event:', error);
      throw error;
    }
  }

  // Ticket Purchase
  async purchaseTickets(eventId: number, amount: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const event = await this.getEventDetails(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      const totalCost = BigInt(event.price) * BigInt(amount);

      const tx = await this.contract.purchaseTickets(eventId, amount, {
        value: totalCost
      });

      await tx.wait();
      console.log('Tickets purchased successfully');
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      throw error;
    }
  }

  // Ticket Request (for free private events)
  async requestTickets(eventId: number, amount: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.requestTickets(eventId, amount);
      await tx.wait();
      console.log('Ticket request submitted successfully');
    } catch (error) {
      console.error('Failed to request tickets:', error);
      throw error;
    }
  }

  // Ticket Approval/Rejection (for admins)
  async approveRequest(requester: string, eventId: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.approveRequest(requester, eventId);
      await tx.wait();
      console.log('Ticket request approved successfully');
    } catch (error) {
      console.error('Failed to approve ticket request:', error);
      throw error;
    }
  }

  async rejectRequest(requester: string, eventId: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.rejectRequest(requester, eventId);
      await tx.wait();
      console.log('Ticket request rejected successfully');
    } catch (error) {
      console.error('Failed to reject ticket request:', error);
      throw error;
    }
  }

  // Event Queries
  async getEventDetails(eventId: number) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      console.log('🔄 Fetching event details for eventId:', eventId);
      
      const eventInfo = await this.contract.getEventDetailsInfo(eventId);
      console.log('📋 Raw event info from contract:', eventInfo);
      
      // Check if event exists
      if (!eventInfo || !eventInfo.organizer || eventInfo.organizer === '0x0000000000000000000000000000000000000000') {
        console.error('❌ Event not found or invalid organizer');
        throw new Error('Event not found');
      }
      
      // Check metadata URI
      if (!eventInfo.metadataURI || eventInfo.metadataURI === '') {
        console.error('❌ Event metadata URI is empty');
        throw new Error('Event metadata is missing');
      }
      
      if (eventInfo.metadataURI.startsWith('ipfs://')){
        console.warn('⚠️ Event uses IPFS metadata, which is not supported in this version');
        throw new Error('Event uses IPFS metadata which is not supported');
      } 
      
      console.log('✅ Event info retrieved successfully');
      
      let metadata;
      try {
        metadata = JSON.parse(eventInfo.metadataURI);
        console.log('✅ Metadata parsed successfully:', metadata);
      } catch (parseError) {
        console.error('❌ Failed to parse event metadata:', parseError);
        console.error('❌ Raw metadata URI:', eventInfo.metadataURI);
        throw new Error('Failed to parse event metadata');
      }
      
      const eventDetails = {
        eventId: eventInfo.eventId,
        metadata: metadata,
        organizer: eventInfo.organizer,
        maxTickets: eventInfo.maxTickets,
        ticketsSold: eventInfo.ticketsSold,
        price: eventInfo.price.toString(),
        active: eventInfo.active,
        isPrivate: eventInfo.isPrivate,
        tribeId: eventInfo.tribeId,
        tribeName: eventInfo.tribeName,
        ticketHolders: eventInfo.ticketHolders,
        totalTicketHolders: eventInfo.totalTicketHolders
      };
      
      console.log('✅ Event details processed successfully:', eventDetails);
      return eventDetails;
    } catch (error) {
      console.error('❌ Failed to get event details:', error);
      throw error;
    }
  }

  async getEventCapacityInfo(eventId: number): Promise<EventCapacityInfo> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const capacityInfo = await this.contract.getEventCapacityInfo(eventId);
      
      return {
        maxTickets: capacityInfo.maxTickets,
        ticketsSold: capacityInfo.ticketsSold,
        remainingTickets: capacityInfo.remainingTickets,
        capacityPercentage: capacityInfo.capacityPercentage
      };
    } catch (error) {
      console.error('Failed to get event capacity info:', error);
      throw error;
    }
  }

  async getEventPendingRequests(eventId: number): Promise<TicketRequest[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [requesters, amounts] = await this.contract.getEventPendingRequests(eventId);
      
      return requesters.map((requester: string, index: number) => ({
        requester,
        amount: amounts[index]
      }));
    } catch (error) {
      console.error('Failed to get pending requests:', error);
      throw error;
    }
  }

  // User-specific queries
  async getUserTicketRequest(user: string, eventId: number): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getUserTicketRequest(user, eventId);
    } catch (error) {
      console.error('Failed to get user ticket request:', error);
      return 0;
    }
  }

  async doesUserHaveTickets(user: string, eventId: number): Promise<{ hasTickets: boolean; ticketCount: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const result = await this.contract.doesUserHaveTickets(user, eventId);
      return {
        hasTickets: result.hasTickets,
        ticketCount: result.ticketCount
      };
    } catch (error) {
      console.error('Failed to check user tickets:', error);
      return { hasTickets: false, ticketCount: 0 };
    }
  }

  async getUserEvents(user: string): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getUserEvents(user);
    } catch (error) {
      console.error('Failed to get user events:', error);
      return [];
    }
  }

  // Tribe-specific queries
  async getEventsByTribe(tribeId: number): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getEventsByTribe(tribeId);
    } catch (error) {
      console.error('Failed to get tribe events:', error);
      return [];
    }
  }

  async getEventsByTribePaginated(tribeId: number, offset: number, limit: number): Promise<{ eventIds: number[]; total: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const result = await this.contract.getEventsByTribePaginated(tribeId, offset, limit);
      return {
        eventIds: result.eventIds,
        total: result.total
      };
    } catch (error) {
      console.error('Failed to get tribe events paginated:', error);
      return { eventIds: [], total: 0 };
    }
  }

  async getTribeEventStats(tribeId: number): Promise<TribeEventStats> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const stats = await this.contract.getTribeEventStats(tribeId);
      return {
        totalEvents: stats.totalEvents,
        activeEvents: stats.activeEvents,
        totalTicketsSold: stats.totalTicketsSold,
        totalRevenue: stats.totalRevenue.toString()
      };
    } catch (error) {
      console.error('Failed to get tribe event stats:', error);
      throw error;
    }
  }

  // Organizer queries
  async getEventsByOrganizer(organizer: string): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getEventsByOrganizer(organizer);
    } catch (error) {
      console.error('Failed to get organizer events:', error);
      return [];
    }
  }

  async getOrganizerStats(organizer: string): Promise<OrganizerStats> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const stats = await this.contract.getOrganizerStats(organizer);
      return {
        totalEvents: stats.totalEvents,
        activeEvents: stats.activeEvents,
        totalTicketsSold: stats.totalTicketsSold,
        totalRevenue: stats.totalRevenue.toString()
      };
    } catch (error) {
      console.error('Failed to get organizer stats:', error);
      throw error;
    }
  }

  // System-wide queries
  async getTotalEvents(): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getTotalEvents();
    } catch (error) {
      console.error('Failed to get total events:', error);
      return 0;
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const stats = await this.contract.getSystemStats();
      return {
        totalTribes: stats.totalTribes,
        totalEvents: stats.totalEvents,
        totalActiveEvents: stats.totalActiveEvents,
        totalTicketsSold: stats.totalTicketsSold
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }

  async getFreeEvents(): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getFreeEvents();
    } catch (error) {
      console.error('Failed to get free events:', error);
      return [];
    }
  }

  async getPaidEvents(): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getPaidEvents();
    } catch (error) {
      console.error('Failed to get paid events:', error);
      return [];
    }
  }

  async getEventsByStatus(active: boolean): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getEventsByStatus(active);
    } catch (error) {
      console.error('Failed to get events by status:', error);
      return [];
    }
  }

  async getEventsByPriceRange(minPrice: string, maxPrice: string): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const minPriceWei = ethers.parseEther(minPrice);
      const maxPriceWei = ethers.parseEther(maxPrice);

      return await this.contract.getEventsByPriceRange(minPriceWei, maxPriceWei);
    } catch (error) {
      console.error('Failed to get events by price range:', error);
      return [];
    }
  }

  // Utility functions
  async getEventTicketHolders(eventId: number): Promise<string[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getEventTicketHolders(eventId);
    } catch (error) {
      console.error('Failed to get event ticket holders:', error);
      return [];
    }
  }

  async userHasTickets(eventId: number, user: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.userHasTickets(eventId, user);
    } catch (error) {
      console.error('Failed to check if user has tickets:', error);
      return false;
    }
  }

  // Helper function to get event status
  getEventStatus(event: EventDetails): 'upcoming' | 'ongoing' | 'past' | 'cancelled' {
    if (!event.active) {
      return 'cancelled';
    }

    const now = new Date();
    const startTime = new Date(event.metadata.startTime);
    const endTime = new Date(event.metadata.endTime);

    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'ongoing';
    } else {
      return 'past';
    }
  }

  // Helper function to check if user can purchase more tickets
  async canUserPurchaseMoreTickets(user: string, eventId: number, requestedAmount: number): Promise<boolean> {
    try {
      const event = await this.getEventDetails(eventId);
      if (!event) {
        return false;
      }
      
      const userTickets = await this.doesUserHaveTickets(user, eventId);
      
      const currentUserTickets = userTickets.ticketCount;
      const maxCapacity = event.metadata.maxCapacity;
      
      return (currentUserTickets + requestedAmount) <= maxCapacity;
    } catch (error) {
      console.error('Failed to check purchase capacity:', error);
      return false;
    }
  }
}

// Global instance
export const eventTicketsService = new EventTicketsService(); 