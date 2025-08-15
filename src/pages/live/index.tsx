import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Play, Users, Clock, Loader2, Calendar } from 'lucide-react';
import { mockLiveSessions } from '../../data/mockData';
import { LiveSessionCard } from '../../components/cards/LiveSessionCard';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/layout/PageTransition';
import { eventTicketsService, EventDetails } from '../../services/EventTicketsService';
import { EventCard } from '../../components/cards/EventCard';
import { useWalletStore } from '../../store/walletStore';

export default function LiveSessionsPage() {
  const { address } = useWalletStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userEvents, setUserEvents] = useState<EventDetails[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const filteredSessions = mockLiveSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', 'live', 'upcoming', 'ended'];

  // Load user's events where they have purchased tickets
  useEffect(() => {
    const loadUserEvents = async () => {
      if (!address) return;

      try {
        setEventsLoading(true);
        await eventTicketsService.initialize();
        
        // Get all events where user has tickets
        const userEventIds = await eventTicketsService.getUserEvents(address);
        const eventsWithDetails = await Promise.all(
          userEventIds.map(async (eventId) => {
            return await eventTicketsService.getEventDetails(eventId);
          })
        );
        
        // Filter to only events where user actually has tickets
        const eventsWithTickets = await Promise.all(
          eventsWithDetails.map(async (event) => {
            const { hasTickets } = await eventTicketsService.doesUserHaveTickets(address, event.eventId);
            return hasTickets ? event : null;
          })
        );
        
        const validEvents = eventsWithTickets.filter(event => event !== null) as EventDetails[];
        setUserEvents(validEvents);
      } catch (error) {
        console.error('Failed to load user events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadUserEvents();
  }, [address]);

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Live Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join live discussions and events
            </p>
          </div>
          <Link to="/live/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-lightCard dark:bg-darkCard text-black dark:text-white hover:bg-lightCard/80 dark:hover:bg-darkCard/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* User's Events Section */}
        {address && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-[#BBF10A]" />
              <h2 className="text-xl font-semibold text-black dark:text-white">
                My Events
              </h2>
            </div>
            
            {eventsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                <p className="text-gray-600 dark:text-gray-400">Loading your events...</p>
              </div>
            ) : userEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No events yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Purchase tickets to events to see them here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {userEvents.map((event) => (
                  <EventCard
                    key={event.eventId}
                    event={event}
                    onViewDetails={(eventId) => {
                      window.open(`/events/${eventId}`, '_blank');
                    }}
                    onPurchaseTickets={(eventId) => {
                      console.log('Purchase tickets for event:', eventId);
                    }}
                    onRequestTickets={(eventId) => {
                      console.log('Request tickets for event:', eventId);
                    }}
                    userAddress={address || undefined}
                    showTribeName={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Sessions Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Play className="h-5 w-5 text-[#BBF10A]" />
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Live Sessions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No sessions found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
} 