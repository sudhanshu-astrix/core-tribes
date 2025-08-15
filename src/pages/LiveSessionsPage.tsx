import { useState, useEffect } from 'react';
import { Search, Calendar, Video, Mic, MessageSquare, ChevronLeft, ChevronRight, Loader2, Clock, Users, MapPin, DollarSign, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LiveSession } from '../types';
import { LiveSessionCard } from '../components/cards/LiveSessionCard';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { useTribeStore } from '../store/store';
import { Card, CardContent } from '../components/ui/Card';
import { eventContractService, EventWithMetadata } from '../services/EventContract';
import { eventTicketsService, EventDetails } from '../services/EventTicketsService';
import { tribeContractService } from '../services/TribeContract';
import { useWalletStore } from '../store/walletStore';
import { formatEther } from 'ethers';

// Mock data for live sessions
const mockLiveSessions: LiveSession[] = [
  {
    id: '1',
    title: 'Hangout with Mega Core Team',
    description: "It's been a long time since the core team has had a direct chat with you all. Hang out with Brother Bing, Bread, Namik, Lei, M.u along with a special guest - this Friday! We want to share some mega updates and maybe give away some mega merch to participants!",
    startTime: '2024-05-30T19:00:00Z',
    endTime: '2024-05-30T20:00:00Z',
    type: 'call',
    status: 'upcoming',
    host: {
      id: '1',
      username: 'Ishan',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    community: {
      id: '1',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    participants: 135,
  },
  // ... other mock sessions
];

type SessionType = 'all' | 'ama' | 'meeting' | 'call';
type SessionStatus = 'upcoming' | 'past';
type ViewMode = 'list' | 'calendar';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function LiveSessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('upcoming');
  const [eventSourceFilter, setEventSourceFilter] = useState<'all' | 'tribe' | 'purchased' | 'public'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventWithMetadata[]>([]);
  const [userTribeEvents, setUserTribeEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTicketBalances, setUserTicketBalances] = useState<Record<number, number>>({});
  const { posts } = useTribeStore();
  const { address } = useWalletStore();

  // Load events from blockchain and user's tribes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        await eventContractService.initialize();
        await eventTicketsService.initialize();
        await tribeContractService.initialize();
        
        const allEvents = await eventContractService.getAllEvents();
        setEvents(allEvents);

                  // Load events from user's tribes and user's purchased events if wallet is connected
          if (address) {
            const userTribeEventsList: EventDetails[] = [];
            const userPurchasedEventsList: EventDetails[] = [];
            
            try {
              // Get all tribes
              const allTribes = await tribeContractService.getAllTribes();
              console.log('Total tribes found:', allTribes.length);
              
              // Check which tribes the user is a member of or owns
              for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
                try {
                  const isMember = await tribeContractService.isMember(tribeId, address);
                  const tribeAdmin = await tribeContractService.getTribeAdmin(tribeId);
                  const isOwner = tribeAdmin.toLowerCase() === address.toLowerCase();
                  
                  console.log(`Tribe ${tribeId}: isMember=${isMember}, isOwner=${isOwner}`);
                  
                  if (isMember || isOwner) {
                    console.log(`User is part of tribe ${tribeId}, loading events...`);
                    
                    // Get events for this tribe
                    const tribeEventIds = await eventTicketsService.getEventsByTribe(tribeId);
                    console.log(`Tribe ${tribeId} has ${tribeEventIds.length} events`);
                    
                    const tribeEvents = await Promise.all(
                      tribeEventIds.map(async (eventId) => {
                        try {
                          const eventDetails = await eventTicketsService.getEventDetails(eventId);
                          console.log(`Loaded event ${eventId} for tribe ${tribeId}`);
                          return eventDetails;
                        } catch (error) {
                          console.warn(`Failed to get details for event ${eventId}:`, error);
                          return null;
                        }
                      })
                    );
                    
                    // Filter out null events and add to list
                    const validEvents = tribeEvents.filter(event => event !== null) as EventDetails[];
                    userTribeEventsList.push(...validEvents);
                    console.log(`Added ${validEvents.length} valid events from tribe ${tribeId}`);
                  }
                } catch (error) {
                  console.warn(`Failed to check membership for tribe ${tribeId}:`, error);
                }
              }
              
              // Load events where user has purchased tickets
              console.log('Loading events where user has purchased tickets...');
              for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
                try {
                  const tribeEventIds = await eventTicketsService.getEventsByTribe(tribeId);
                  
                  for (const eventId of tribeEventIds) {
                    try {
                      // Check if user has tickets for this event
                      const userTicketInfo = await eventTicketsService.doesUserHaveTickets(address, eventId);
                      
                      if (userTicketInfo.hasTickets && userTicketInfo.ticketCount > 0) {
                        // Get event details
                        const eventDetails = await eventTicketsService.getEventDetails(eventId);
                        if (eventDetails) {
                          // Check if this event is not already in userTribeEventsList
                          const isAlreadyIncluded = userTribeEventsList.some(event => event.eventId === eventId);
                          if (!isAlreadyIncluded) {
                            userPurchasedEventsList.push(eventDetails);
                            console.log(`Added purchased event ${eventId} to list`);
                          }
                        }
                      }
                    } catch (error) {
                      console.warn(`Failed to check tickets for event ${eventId}:`, error);
                    }
                  }
                } catch (error) {
                  console.warn(`Failed to load events for tribe ${tribeId}:`, error);
                }
              }
              
              console.log(`Total user tribe events loaded: ${userTribeEventsList.length}`);
              console.log(`Total user purchased events loaded: ${userPurchasedEventsList.length}`);
              
              // Combine both lists, removing duplicates
              const combinedEvents = [...userTribeEventsList];
              userPurchasedEventsList.forEach(event => {
                if (!combinedEvents.some(existingEvent => existingEvent.eventId === event.eventId)) {
                  combinedEvents.push(event);
                }
              });
              
              setUserTribeEvents(combinedEvents);
            } catch (error) {
              console.error('Failed to load user tribe events:', error);
            }

          // Load user ticket balances
          const balances: Record<number, number> = {};
          for (const event of allEvents) {
            const balance = await eventContractService.getTicketBalance(address, event.eventId);
            balances[event.eventId] = balance;
          }
          
          // Also load ticket balances for user tribe events
          for (const event of userTribeEventsList) {
            const balance = await eventTicketsService.doesUserHaveTickets(address, event.eventId);
            balances[event.eventId] = balance.ticketCount;
          }
          
          setUserTicketBalances(balances);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [address]);

  // Filter events based on status
  const filteredEvents = events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.metadata.startDateTime);
    const endDate = new Date(event.metadata.endDateTime);

    if (statusFilter === 'upcoming') {
      return startDate > now;
    } else {
      return endDate < now;
    }
  });

  // Filter user tribe events based on status
  const filteredUserTribeEvents = userTribeEvents.filter(event => {
    const now = new Date();
    const startDate = new Date(event.metadata.startTime);
    const endDate = new Date(event.metadata.endTime);

    if (statusFilter === 'upcoming') {
      return startDate > now;
    } else {
      return endDate < now;
    }
  });

  // Helper function to get event start time
  const getEventStartTime = (event: EventWithMetadata | EventDetails) => {
    if ('startDateTime' in event.metadata) {
      return new Date(event.metadata.startDateTime);
    } else {
      return new Date(event.metadata.startTime);
    }
  };

  // Helper function to get event end time
  const getEventEndTime = (event: EventWithMetadata | EventDetails) => {
    if ('endDateTime' in event.metadata) {
      return new Date(event.metadata.endDateTime);
    } else {
      return new Date(event.metadata.endTime);
    }
  };

  // Helper function to get event location
  const getEventLocation = (event: EventWithMetadata | EventDetails) => {
    if ('locationType' in event.metadata) {
      return event.metadata.locationType;
    } else {
      return event.metadata.location || 'Virtual';
    }
  };

  // Helper function to get event max capacity
  const getEventMaxCapacity = (event: EventWithMetadata | EventDetails) => {
    if ('maxCapacity' in event.metadata) {
      return Number(event.metadata.maxCapacity);
    } else {
      // Default max capacity if not specified
      return Number(event.maxTickets);
    }
  };

  // Helper function to check if user can buy more tickets
  const canUserBuyMoreTickets = (event: EventWithMetadata | EventDetails, userTickets: number) => {
    const maxCapacity = getEventMaxCapacity(event);
    return userTickets < maxCapacity;
  };

  // Helper function to get event source badge
  const getEventSourceBadge = (event: EventWithMetadata | EventDetails, userTickets: number) => {
    // Check if this is a user tribe event (user is member or owner)
    const isUserTribeEvent = userTribeEvents.some(tribeEvent => tribeEvent.eventId === event.eventId);
    
    if (isUserTribeEvent) {
      return {
        label: 'Your Tribe',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        icon: '👥'
      };
    } else if (userTickets > 0) {
      return {
        label: 'Purchased',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: '🎫'
      };
    } else {
      return {
        label: 'Public',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
        icon: '🌐'
      };
    }
  };

  // Filter events by source
  const filterEventsBySource = (events: (EventWithMetadata | EventDetails)[]) => {
    if (eventSourceFilter === 'all') return events;
    
    return events.filter(event => {
      const userTickets = userTicketBalances[event.eventId] || 0;
      const eventSourceBadge = getEventSourceBadge(event, userTickets);
      
      switch (eventSourceFilter) {
        case 'tribe':
          return eventSourceBadge.label === 'Your Tribe';
        case 'purchased':
          return eventSourceBadge.label === 'Purchased';
        case 'public':
          return eventSourceBadge.label === 'Public';
        default:
          return true;
      }
    });
  };

  // Combine all events for display
  const allFilteredEvents = filterEventsBySource([...filteredEvents, ...filteredUserTribeEvents]);

  // Handle ticket purchase
  const handlePurchaseTickets = async (eventId: number, amount: number = 1) => {
    if (!address) {
      alert('Please connect your wallet to purchase tickets');
      return;
    }

    try {
      const event = events.find(e => e.eventId === eventId);
      if (!event) return;

      if (event.isPrivate) {
        // Request tickets for private events
        await eventContractService.requestTickets(eventId, amount);
        alert('Ticket request submitted! Please wait for organizer approval.');
      } else {
        // Purchase tickets directly for public events
        await eventContractService.purchaseTickets(eventId, amount);
        alert('Tickets purchased successfully!');
      }

      // Refresh ticket balances
      const newBalance = await eventContractService.getTicketBalance(address, eventId);
      setUserTicketBalances(prev => ({
        ...prev,
        [eventId]: newBalance
      }));
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      alert('Failed to purchase tickets. Please try again.');
    }
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Events</h1>
          </div>
          <Link to="/live/new">
            <Button size="sm" className="bg-primary text-black hover:bg-primary/90">
              + Create Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  All Events
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Events from all communities, your tribes, and events you've purchased tickets for ({userTribeEvents.length} from your tribes/purchases)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <button
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'upcoming'
                      ? 'bg-lightCard dark:bg-darkCard text-neonBlue'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setStatusFilter('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    statusFilter === 'past'
                      ? 'bg-lightCard dark:bg-darkCard text-neonBlue'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setStatusFilter('past')}
                >
                  Past
                </button>
              </div>
            </div>

            {loading ? (
              // Loading state
              <div className="text-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-[#BBF10A] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  Loading Events
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fetching events from blockchain...
                </p>
              </div>
            ) : allFilteredEvents.length === 0 ? (
              // Empty state
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    No {statusFilter === 'upcoming' ? 'Upcoming' : 'Past'} Events
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {statusFilter === 'upcoming' 
                      ? 'No upcoming events scheduled'
                      : 'No past events found'
                    }
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Check back later for community events</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              allFilteredEvents.map((event) => {
                const userTickets = userTicketBalances[event.eventId] || 0;
                const isUpcoming = getEventStartTime(event) > new Date();
                const priceInXDC = parseFloat(event.price.toString()) > 0 ? formatEther(event.price.toString()) : '0';
                const eventSourceBadge = getEventSourceBadge(event, userTickets);

                return (
                  <Card key={event.eventId} className="p-6 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-black dark:text-white">
                              {event.metadata.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Hosted by {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Event Source Badge */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${eventSourceBadge.color}`}>
                            <span>{eventSourceBadge.icon}</span>
                            <span>{eventSourceBadge.label}</span>
                          </div>
                          
                          {/* Event Type Badge */}
                          {event.isPrivate ? (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-[#BBF10A]/20 dark:bg-gray-700 text-black dark:text-[#BBF10A] rounded-full text-xs">
                              <Lock className="w-3 h-3" />
                              <span>Private</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                              <Globe className="w-3 h-3" />
                              <span>Public</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {event.metadata.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-[#BBF10A]" />
                          <span className="text-black dark:text-white">
                            {getEventStartTime(event).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-[#BBF10A]" />
                          <span className="text-black dark:text-white">
                            {getEventStartTime(event).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-[#BBF10A]" />
                          <span className="text-black dark:text-white capitalize">
                            {getEventLocation(event)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="w-4 h-4 text-[#BBF10A]" />
                          <span className="text-black dark:text-white">
                            {event.ticketsSold}/{event.maxTickets}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                          {parseFloat(event.price.toString()) > 0 ? (
                            <div className="flex items-center space-x-1 text-sm">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-black dark:text-white font-medium">
                                {priceInXDC} XDC
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-sm">
                              <span className="text-green-500 font-medium">Free</span>
                            </div>
                          )}
                          
                          {userTickets > 0 && (
                            <div className="flex items-center space-x-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                              <span>✓ {userTickets} ticket{userTickets > 1 ? 's' : ''} purchased</span>
                            </div>
                          )}
                        </div>

                        {isUpcoming && event.active && (
                          <div className="flex items-center space-x-2">
                            {userTickets > 0 ? (
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" disabled>
                                  {userTickets} Ticket{userTickets > 1 ? 's' : ''} Purchased
                                </Button>
                                {canUserBuyMoreTickets(event, userTickets) ? (
                                  <Button
                                    onClick={() => handlePurchaseTickets(event.eventId)}
                                    disabled={Number(event.ticketsSold) >= Number(event.maxTickets)}
                                    className="group transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 12 }}
                                  >
                                    {parseFloat(event.price.toString()) === 0 ? 'Claim More' : 'Buy More'}
                                  </Button>
                                ) : (
                                  <span className="text-xs text-red-500 dark:text-red-400">
                                    Limit Reached
                                  </span>
                                )}
                              </div>
                            ) : (
                                                              <Button
                                  onClick={() => handlePurchaseTickets(event.eventId)}
                                  disabled={Number(event.ticketsSold) >= Number(event.maxTickets)}
                                  className="group transition-all duration-200 hover:scale-105"
                                  style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 12 }}
                                >
                                  {Number(event.ticketsSold) >= Number(event.maxTickets) ? 'Sold Out' : (parseFloat(event.price.toString()) === 0 ? 'Claim Ticket' : 'Get Tickets')}
                                </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Calendar */}
          <div className="bg-lightCard dark:bg-darkCard rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-lg font-medium text-black dark:text-white">
                  {currentMonth.toLocaleString('default', { month: 'long' })}
                </span>
                <button onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm text-gray-600 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {previousMonthDays.map((day) => (
                <div
                  key={`prev-${day}`}
                  className="h-10 flex items-center justify-center text-sm text-lightTextSecondary/30 dark:text-blackSecondary/30"
                />
              ))}
              {days.map((day) => {
                // Check if this day has events from both sources
                const dayEvents = allFilteredEvents.filter(event => {
                  const eventDate = getEventStartTime(event);
                  return eventDate.getDate() === day && 
                         eventDate.getMonth() === currentMonth.getMonth() &&
                         eventDate.getFullYear() === currentMonth.getFullYear();
                });

                return (
                  <button
                    key={day}
                    className={`h-10 flex items-center justify-center text-sm rounded-full relative
                      ${
                        dayEvents.length > 0
                          ? 'bg-accentBlue text-white font-medium'
                          : 'text-black dark:text-white hover:bg-lightCardHover dark:hover:bg-darkCardHover'
                      }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}