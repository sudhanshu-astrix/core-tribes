import React from 'react';
import { Calendar, Clock, MapPin, Users, Tag, ExternalLink } from 'lucide-react';
import { EventDetails } from '../../services/EventTicketsService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface EventCardProps {
  event: EventDetails;
  onViewDetails: (eventId: number) => void;
  onPurchaseTickets?: (eventId: number) => void;
  onRequestTickets?: (eventId: number) => void;
  userAddress?: string;
  isAdmin?: boolean;
  showTribeName?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onPurchaseTickets,
  onRequestTickets,
  userAddress,
  isAdmin = false,
  showTribeName = false
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'ongoing':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'past':
        return <Calendar className="w-4 h-4" />;
      case 'cancelled':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const status = getEventStatus(event);
  const isUserAttending = event.ticketHolders.includes(userAddress || '');
  const isEventFull = event.ticketsSold >= event.maxTickets;
  const canPurchase = status === 'upcoming' && !isEventFull && event.active;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <div className="flex gap-4">
        {/* Left side - Calendar and Date */}
        <div className="flex flex-col items-center justify-start pt-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg">
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs font-bold">
              {new Date(event.metadata.date).getDate()}
            </span>
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate(event.metadata.date)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {formatTime(event.metadata.time)}
            </div>
          </div>
        </div>

        {/* Right side - Event Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {event.metadata.title}
              </h3>
              {showTribeName && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  {event.tribeName}
                </p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {event.metadata.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.metadata.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.ticketsSold}/{event.maxTickets} tickets</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{event.metadata.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(event.price)}
              </span>
              {event.isPrivate && (
                                        <span className="px-2 py-1 bg-gray-700 text-white dark:bg-[#BBF10A]/30 dark:text-[#BBF10A] rounded-full text-xs">
                  Private
                </span>
              )}
              {isUserAttending && (
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                  Attending
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canPurchase && !isUserAttending && (
                <>
                  {event.price === '0' ? (
                    event.isPrivate ? (
                      <Button
                        size="sm"
                        onClick={() => onRequestTickets?.(event.eventId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Request Tickets
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onPurchaseTickets?.(event.eventId)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Get Free Tickets
                      </Button>
                    )
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onPurchaseTickets?.(event.eventId)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Buy Tickets
                    </Button>
                  )}
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(event.eventId)}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Details
              </Button>
            </div>
          </div>

          {isEventFull && status === 'upcoming' && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                Event is sold out
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};