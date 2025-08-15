import { ethers } from 'ethers';
import EventTicketsABI from '../abis/EventTickets.json';
import { contractsConfig } from '../config/contracts.config';
import { networksConfig } from '../config/networks.config';

export interface EventDetails {
  metadataURI: string;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: number;
  active: boolean;
  isPrivate: boolean;
}

export interface ParsedEventMetadata {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  locationType: 'virtual' | 'physical';
  tribeId: number;
  createdBy: string;
  createdAt: string;
}

export interface EventWithMetadata extends EventDetails {
  eventId: number;
  metadata: ParsedEventMetadata;
}

class EventContractService {
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
      const contractAddress = contractsConfig.xdc.EventTickets;

      // Initialize contract
      this.contract = new ethers.Contract(
        contractAddress,
        EventTicketsABI.abi,
        this.signer
      );

      console.log('Event contract service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize event contract service:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.contract || !this.signer) {
      throw new Error('Event contract service not initialized. Call initialize() first.');
    }
  }

  // Create a new event
  async createEvent(
    metadataURI: string,
    maxTickets: number,
    price: number, // Price in wei
    isPrivate: boolean
  ): Promise<number> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.createEvent(
        metadataURI,
        maxTickets,
        price,
        isPrivate
      );

      const receipt = await tx.wait();
      
      // Find the EventCreated event
      const eventCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'EventCreated';
        } catch {
          return false;
        }
      });

      if (eventCreatedEvent) {
        const parsedLog = this.contract!.interface.parseLog(eventCreatedEvent);
        if (parsedLog) {
          return parsedLog.args.eventId;
        }
      }
      
      throw new Error('EventCreated event not found in transaction receipt');
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  // Get event details by ID
  async getEventDetails(eventId: number): Promise<EventDetails> {
    this.ensureInitialized();

    try {
      const event = await this.contract!.events(eventId);
      return {
        metadataURI: event.metadataURI,
        organizer: event.organizer,
        maxTickets: Number(event.maxTickets),
        ticketsSold: Number(event.ticketsSold),
        price: Number(event.price),
        active: event.active,
        isPrivate: event.isPrivate
      };
    } catch (error) {
      console.error('Failed to get event details:', error);
      throw error;
    }
  }

  // Get event metadata
  async getEventMetadata(eventId: number): Promise<ParsedEventMetadata | null> {
    try {
      const eventDetails = await this.getEventDetails(eventId);
      const metadata = JSON.parse(eventDetails.metadataURI);
      
      return {
        title: metadata.title || '',
        description: metadata.description || '',
        startDateTime: metadata.startDateTime || '',
        endDateTime: metadata.endDateTime || '',
        location: metadata.location || '',
        locationType: metadata.locationType || 'virtual',
        tribeId: metadata.tribeId || 0,
        createdBy: metadata.createdBy || '',
        createdAt: metadata.createdAt || ''
      };
    } catch (error) {
      console.error('Failed to parse event metadata:', error);
      return null;
    }
  }

  // Get event with metadata
  async getEventWithMetadata(eventId: number): Promise<EventWithMetadata | null> {
    try {
      const eventDetails = await this.getEventDetails(eventId);
      const metadata = await this.getEventMetadata(eventId);

      if (!metadata) {
        return null;
      }

      return {
        eventId,
        ...eventDetails,
        metadata
      };
    } catch (error) {
      console.error('Failed to get event with metadata:', error);
      return null;
    }
  }

  // Get all events (iterate until we find an empty organizer)
  async getAllEvents(): Promise<EventWithMetadata[]> {
    this.ensureInitialized();

    const events: EventWithMetadata[] = [];
    let eventId = 0;

    try {
      while (true) {
        const eventDetails = await this.getEventDetails(eventId);
        
        // Check if event exists (organizer is not zero address)
        if (eventDetails.organizer === ethers.ZeroAddress) {
          break;
        }

        const eventWithMetadata = await this.getEventWithMetadata(eventId);
        if (eventWithMetadata) {
          events.push(eventWithMetadata);
        }

        eventId++;
      }
    } catch (error) {
      console.error('Failed to get all events:', error);
    }

    return events;
  }

  // Get events by tribe ID
  async getEventsByTribeId(tribeId: number): Promise<EventWithMetadata[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.metadata.tribeId === tribeId);
  }

  // Purchase tickets
  async purchaseTickets(eventId: number, amount: number): Promise<void> {
    this.ensureInitialized();

    try {
      const eventDetails = await this.getEventDetails(eventId);
      const totalCost = eventDetails.price * amount;

      const tx = await this.contract!.purchaseTickets(eventId, amount, {
        value: totalCost
      });

      await tx.wait();
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      throw error;
    }
  }

  // Request tickets (for private events)
  async requestTickets(eventId: number, amount: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.requestTickets(eventId, amount);
      await tx.wait();
    } catch (error) {
      console.error('Failed to request tickets:', error);
      throw error;
    }
  }

  // Approve ticket request (only organizer)
  async approveRequest(requester: string, eventId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.approveRequest(requester, eventId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to approve ticket request:', error);
      throw error;
    }
  }

  // Reject ticket request (only organizer)
  async rejectRequest(requester: string, eventId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.rejectRequest(requester, eventId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to reject ticket request:', error);
      throw error;
    }
  }

  // Cancel event (only organizer)
  async cancelEvent(eventId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.cancelEvent(eventId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to cancel event:', error);
      throw error;
    }
  }

  // Get ticket balance for a user
  async getTicketBalance(userAddress: string, eventId: number): Promise<number> {
    this.ensureInitialized();

    try {
      const balance = await this.contract!.balanceOf(userAddress, eventId);
      return Number(balance);
    } catch (error) {
      console.error('Failed to get ticket balance:', error);
      return 0;
    }
  }

  // Get ticket request amount for a user
  async getTicketRequestAmount(userAddress: string, eventId: number): Promise<number> {
    this.ensureInitialized();

    try {
      const amount = await this.contract!.ticketRequests(userAddress, eventId);
      return Number(amount);
    } catch (error) {
      console.error('Failed to get ticket request amount:', error);
      return 0;
    }
  }

  // Check if event exists
  async eventExists(eventId: number): Promise<boolean> {
    this.ensureInitialized();

    try {
      const eventDetails = await this.getEventDetails(eventId);
      return eventDetails.organizer !== ethers.ZeroAddress;
    } catch (error) {
      return false;
    }
  }

  // Get total supply of tickets for an event
  async getTotalSupply(eventId: number): Promise<number> {
    this.ensureInitialized();

    try {
      const totalSupply = await this.contract!.totalSupply(eventId);
      return Number(totalSupply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }

  // Format price from wei to XDC
  formatPrice(priceInWei: number): string {
    return ethers.formatEther(priceInWei.toString());
  }

  // Convert XDC to wei
  convertToWei(priceInXDC: number): string {
    return ethers.parseEther(priceInXDC.toString()).toString();
  }
}

export const eventContractService = new EventContractService(); 