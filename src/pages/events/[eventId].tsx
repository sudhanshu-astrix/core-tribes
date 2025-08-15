import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  DollarSign, 
  Lock, 
  Globe, 
  UserCheck, 
  UserX, 
  Edit, 
  X,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { 
  EventDetails, 
  TicketRequest, 
  eventTicketsService 
} from '../../services/EventTicketsService';
import { useWalletStore } from '../../store/walletStore';
import { EventCreateModal } from '../../components/community/EventCreateModal';

export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { address } = useWalletStore();
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ticket purchase/request state
  const [ticketAmount, setTicketAmount] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  // Admin state
  const [pendingRequests, setPendingRequests] = useState<TicketRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // User ticket state
  const [userTickets, setUserTickets] = useState<{ hasTickets: boolean; ticketCount: number }>({ hasTickets: false, ticketCount: 0 });
  const [userRequest, setUserRequest] = useState(0);

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading event details for eventId:', eventId);
      
      // Check if eventId is valid
      if (!eventId || isNaN(parseInt(eventId))) {
        setError('Invalid event ID');
        return;
      }
      
      console.log('✅ EventId is valid:', eventId);
      
      // Initialize service
      console.log('🔄 Initializing EventTicketsService...');
      await eventTicketsService.initialize();
      console.log('✅ EventTicketsService initialized');
      
      // Get event details
      console.log('🔄 Fetching event details...');
      const eventDetails = await eventTicketsService.getEventDetails(parseInt(eventId));
      console.log('📋 Event details response:', eventDetails);
      
      if (!eventDetails) {
        console.error('❌ Event details returned null');
        setError('Event not found or invalid. The event may not exist or may be using IPFS metadata.');
        return;
      }
      
      console.log('✅ Event details loaded successfully:', eventDetails);
      setEvent(eventDetails);
      
      // Load user-specific data
      if (address) {
        console.log('🔄 Loading user-specific data for address:', address);
        try {
          const userTicketInfo = await eventTicketsService.doesUserHaveTickets(address, parseInt(eventId));
          console.log('✅ User ticket info:', userTicketInfo);
          setUserTickets(userTicketInfo);
          
          const userRequestAmount = await eventTicketsService.getUserTicketRequest(address, parseInt(eventId));
          console.log('✅ User request amount:', userRequestAmount);
          setUserRequest(userRequestAmount);
        } catch (userDataError) {
          console.warn('⚠️ Failed to load user-specific data:', userDataError);
          // Don't fail the entire load for user data issues
        }
      }
      
      // Load pending requests if user is admin
      if (address && eventDetails.organizer.toLowerCase() === address.toLowerCase()) {
        console.log('🔄 Loading pending requests for admin...');
        try {
          const requests = await eventTicketsService.getEventPendingRequests(parseInt(eventId));
          console.log('✅ Pending requests:', requests);
          setPendingRequests(requests);
        } catch (requestsError) {
          console.warn('⚠️ Failed to load pending requests:', requestsError);
          // Don't fail the entire load for requests issues
        }
      }
      
      console.log('✅ Event details loading completed successfully');
    } catch (err) {
      console.error('❌ Failed to load event details:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load event details. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Contract not initialized')) {
          errorMessage = 'Failed to connect to blockchain. Please check your wallet connection.';
        } else if (err.message.includes('Event not found')) {
          errorMessage = 'Event not found. The event may have been deleted or never existed.';
        } else if (err.message.includes('MetaMask')) {
          errorMessage = 'MetaMask is required. Please install and connect MetaMask.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price: string) => {
    if (price === '0') {
      return 'Free';
    }
    const priceInEth = parseFloat(price) / 1e18;
    return `${priceInEth} XDC`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'past':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handlePurchaseTickets = async () => {
    if (!address) {
      alert('Please connect your wallet to purchase tickets');
      return;
    }

    if (!event) return;

    try {
      setPurchasing(true);
      
      // Check if user already has tickets and if they can buy more
      const currentUserTickets = userTickets.ticketCount || 0;
      const maxCapacityPerUser = Number(event.metadata.maxCapacity) || Number(event.maxTickets);
      
      if (currentUserTickets + ticketAmount > maxCapacityPerUser) {
        alert(`You cannot purchase ${ticketAmount} more tickets. You already have ${currentUserTickets} tickets and the maximum per user is ${maxCapacityPerUser}.`);
        return;
      }

      await eventTicketsService.purchaseTickets(event.eventId, ticketAmount);
      alert('Tickets purchased successfully!');
      
      // Reload event details
      await loadEventDetails();
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      alert(`Failed to purchase tickets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRequestTickets = async () => {
    if (!address) {
      alert('Please connect your wallet to request tickets');
      return;
    }

    if (!event) return;

    try {
      setRequesting(true);
      
      // Check if user already has tickets and if they can request more
      const currentUserTickets = userTickets.ticketCount || 0;
      const maxCapacityPerUser = Number(event.metadata.maxCapacity) || Number(event.maxTickets);
      
      if (currentUserTickets + ticketAmount > maxCapacityPerUser) {
        alert(`You cannot request ${ticketAmount} more tickets. You already have ${currentUserTickets} tickets and the maximum per user is ${maxCapacityPerUser}.`);
        return;
      }

      await eventTicketsService.requestTickets(event.eventId, ticketAmount);
      alert('Ticket request submitted! Please wait for organizer approval.');
      
      // Reload event details
      await loadEventDetails();
    } catch (error) {
      console.error('Failed to request tickets:', error);
      alert(`Failed to request tickets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRequesting(false);
    }
  };

  const handleApproveRequest = async (requester: string) => {
    if (!event) return;

    try {
      setProcessingRequest(requester);
      await eventTicketsService.approveRequest(requester, event.eventId);
      alert('Ticket request approved successfully!');
      
      // Reload pending requests
      const requests = await eventTicketsService.getEventPendingRequests(event.eventId);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert(`Failed to approve request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requester: string) => {
    if (!event) return;

    try {
      setProcessingRequest(requester);
      await eventTicketsService.rejectRequest(requester, event.eventId);
      alert('Ticket request rejected successfully!');
      
      // Reload pending requests
      const requests = await eventTicketsService.getEventPendingRequests(event.eventId);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert(`Failed to reject request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle event cancellation
  const handleCancelEvent = async () => {
    if (!event) return;
    
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventTicketsService.initialize();
      await eventTicketsService.cancelEvent(event.eventId);
      alert('Event cancelled successfully!');
      // Reload event details to reflect the cancellation
      await loadEventDetails();
    } catch (error) {
      console.error('Failed to cancel event:', error);
      alert('Failed to cancel event. Please try again.');
    }
  };

  const isAdmin = address && event?.organizer.toLowerCase() === address.toLowerCase();
  const status = event ? getEventStatus(event) : 'upcoming';
  const isEventFull = event ? Number(event.ticketsSold) >= Number(event.maxTickets) : false;
  const canPurchase = status === 'upcoming' && !isEventFull && event?.active;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const eventDate = event ? new Date(event.metadata.startTime) : new Date();

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Event not found'}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => loadEventDetails()} className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90">
              <Loader2 className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            
            
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(status)}`}>
              {status === 'ongoing' ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEvent}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Event
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.metadata.image && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={event.metadata.image}
                  alt={event.metadata.title}
                  className="w-full h-full object-contain bg-darkBg rounded-xl"
                />
              </div>
            )}

            {/* Event Details */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {event.metadata.title}
              </h1>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(event.metadata.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>{formatTime(event.metadata.startTime)} - {formatTime(event.metadata.endTime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{event.metadata.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Tag className="w-5 h-5" />
                  <span>{event.metadata.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5" />
                  <span>{event.ticketsSold} of {event.maxTickets} tickets sold</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {event.metadata.description}
                </p>
              </div>
            </Card>

            {/* Guest List */}
            {(userTickets.hasTickets || isAdmin) && event.ticketHolders.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Attendees ({event.ticketHolders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.ticketHolders.map((holder, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {holder.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {holder.slice(0, 6)}...{holder.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Ticket Holder
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Calendar
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevMonth}
                    className="p-1 h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
                    {formatMonthYear(currentMonth)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="p-1 h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Day headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {(() => {
                  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                  const days = [];
                  
                  // Add empty cells for days before the first day of the month
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="h-8"></div>);
                  }
                  
                  // Add days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isEventDay = isSameDay(currentDate, eventDate);
                    const isToday = isSameDay(currentDate, new Date());
                    
                    days.push(
                      <div
                        key={day}
                        className={`h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors ${
                          isEventDay
                            ? 'bg-[#BBF10A] text-black font-semibold'
                            : isToday
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
              
              {event && (
                <div className="mt-4 p-3 bg-[#BBF10A]/10 dark:bg-[#BBF10A]/10 rounded-lg border border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                  <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-[#BBF10A] rounded-full"></div>
                                          <span className="text-sm text-[#BBF10A] dark:text-[#BBF10A] font-medium">
                      Event on {formatDate(event.metadata.startTime)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Ticket Purchase/Request */}
            {canPurchase && (userTickets.ticketCount || 0) < (Number(event.metadata.maxCapacity) || Number(event.maxTickets)) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {userTickets.hasTickets ? 'Buy More Tickets' : 'Get Tickets'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(event.price)}
                    </span>
                    {event.isPrivate && (
                                              <span className="px-2 py-1 bg-gray-700 text-white dark:bg-[#BBF10A]/30 dark:text-[#BBF10A] rounded-full text-xs">
                        Private Event
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Tickets
                    </label>
                    <Input
                      type="number"
                      value={ticketAmount}
                      onChange={(e) => setTicketAmount(parseInt(e.target.value) || 1)}
                      min="1"
                      max={Math.min(
                        Number(event.maxTickets) - Number(event.ticketsSold), 
                        Number(event.metadata.maxCapacity) - (userTickets.ticketCount || 0)
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max {Math.min(
                        Number(event.maxTickets) - Number(event.ticketsSold), 
                        Number(event.metadata.maxCapacity) - (userTickets.ticketCount || 0)
                      )} more tickets (you have {userTickets.ticketCount || 0} already)
                    </p>
                  </div>

                  {event.price === '0' ? (
                    event.isPrivate ? (
                      <Button
                        onClick={handleRequestTickets}
                        disabled={requesting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {requesting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Requesting...
                          </>
                        ) : (
                          'Request Tickets'
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePurchaseTickets}
                        disabled={purchasing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Claiming...
                          </>
                        ) : (
                          'Claim Free Ticket'
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={handlePurchaseTickets}
                      disabled={purchasing}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Purchasing...
                        </>
                      ) : (
                        `Buy Tickets (${formatPrice(event.price)} each)`
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* User Ticket Limit Reached */}
            {canPurchase && (userTickets.ticketCount || 0) >= (Number(event.metadata.maxCapacity) || Number(event.maxTickets)) && (
              <Card className="p-6 bg-[#BBF10A]/10 dark:bg-[#BBF10A]/10 border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-[#BBF10A]" />
                  <div>
                    <h3 className="font-semibold text-[#BBF10A] dark:text-[#BBF10A]">
                      Ticket Purchase Limit Reached
                    </h3>
                    <p className="text-sm text-[#BBF10A] dark:text-[#BBF10A]">
                      You have reached the maximum number of tickets ({userTickets.ticketCount}) allowed per user for this event.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* User Ticket Status */}
            {userTickets.hasTickets && (
              <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      You're Attending!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {userTickets.ticketCount} ticket{userTickets.ticketCount > 1 ? 's' : ''} purchased
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {userRequest > 0 && (
              <Card className="p-6 bg-[#BBF10A]/10 dark:bg-[#BBF10A]/10 border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#BBF10A]" />
                  <div>
                    <h3 className="font-semibold text-[#BBF10A] dark:text-[#BBF10A]">
                      Request Pending
                    </h3>
                    <p className="text-sm text-[#BBF10A] dark:text-[#BBF10A]">
                      {userRequest} ticket{userRequest > 1 ? 's' : ''} requested
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Admin Controls - Pending Requests */}
            {isAdmin && pendingRequests.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Requests ({pendingRequests.length})
                </h3>
                
                <div className="space-y-3">
                  {pendingRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.amount} ticket{request.amount > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.requester)}
                          disabled={processingRequest === request.requester}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingRequest === request.requester ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleRejectRequest(request.requester)}
                          disabled={processingRequest === request.requester}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {processingRequest === request.requester ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Event Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Event Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Organizer</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tribe</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.tribeName}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Number(event.ticketsSold)}/{Number(event.maxTickets)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <EventCreateModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEventUpdated={loadEventDetails}
          tribeId={event.tribeId}
          tribeName={event.tribeName}
          editingEvent={event}
        />
      )}
    </div>
  );
} 