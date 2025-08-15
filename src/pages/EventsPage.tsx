import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Filter, 
  Search, 
  MapPin, 
  Tag, 
  DollarSign, 
  Clock,
  Loader2,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { EventCard } from '../components/cards/EventCard';
import { 
  EventDetails, 
  eventTicketsService 
} from '../services/EventTicketsService';
import { useWalletStore } from '../store/walletStore';

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'past' | 'cancelled';
type PriceFilter = 'all' | 'free' | 'paid';

export default function EventsPage() {
  const navigate = useNavigate();
  const { address } = useWalletStore();
  
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User events state
  const [userEvents, setUserEvents] = useState<EventDetails[]>([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState<EventDetails[]>([]);

  useEffect(() => {
    if (address) {
      loadUserEvents();
    }
  }, [address]);

  const loadUserEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await eventTicketsService.initialize();
      
      // Get events where user has tickets
      const userEventIds = await eventTicketsService.getUserEvents(address!);
      const userEventsWithDetails = await Promise.all(
        userEventIds.map(async (eventId) => {
          return await eventTicketsService.getEventDetails(eventId);
        })
      );
      setUserEvents(userEventsWithDetails);
      
      // Get events created by user
      const createdEventIds = await eventTicketsService.getEventsByOrganizer(address!);
      const createdEventsWithDetails = await Promise.all(
        createdEventIds.map(async (eventId) => {
          return await eventTicketsService.getEventDetails(eventId);
        })
      );
      setUserCreatedEvents(createdEventsWithDetails);
      
      // Combine all events
      const allEvents = [...userEventsWithDetails, ...createdEventsWithDetails];
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.eventId === event.eventId)
      );
      setEvents(uniqueEvents);
      
    } catch (err) {
      console.error('Failed to load user events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event: EventDetails): 'upcoming' | 'ongoing' | 'past' | 'cancelled' => {
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
  };

  const isUserAttending = (event: EventDetails) => {
    return event.ticketHolders.includes(address!);
  };

  const isUserCreator = (event: EventDetails) => {
    return event.organizer.toLowerCase() === address!.toLowerCase();
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      // Status filter
      const status = getEventStatus(event);
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }
      
      // Price filter
      if (priceFilter === 'free' && event.price !== '0') {
        return false;
      }
      if (priceFilter === 'paid' && event.price === '0') {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && event.metadata.category !== categoryFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.metadata.title.toLowerCase().includes(query) ||
          event.metadata.description.toLowerCase().includes(query) ||
          event.metadata.location.toLowerCase().includes(query) ||
          event.tribeName.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  const getCategories = () => {
    const categories = new Set(events.map(event => event.metadata.category));
    return Array.from(categories).sort();
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handlePurchaseTickets = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleRequestTickets = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const filteredEvents = getFilteredEvents();
  const categories = getCategories();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={loadUserEvents}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your event tickets and created events
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('all');
                setPriceFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Events
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, location..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as FilterType)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <Select
                value={priceFilter}
                onValueChange={(value) => setPriceFilter(value as PriceFilter)}
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userEvents.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userCreatedEvents.length}
                </p>
              </div>
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {events.length === 0 
                  ? "You haven't joined any events yet. Explore communities to find events!"
                  : "Try adjusting your filters to see more events."
                }
              </p>
              {events.length === 0 && (
                <Button onClick={() => navigate('/communities')}>
                  Explore Communities
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.eventId}
                  event={event}
                  onViewDetails={handleViewEvent}
                  onPurchaseTickets={handlePurchaseTickets}
                  onRequestTickets={handleRequestTickets}
                  userAddress={address || undefined}
                  isAdmin={isUserCreator(event)}
                  showTribeName={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 