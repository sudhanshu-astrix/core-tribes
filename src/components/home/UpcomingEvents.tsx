import { LiveSession } from '../../types';
import { LiveSessionCard } from '../cards/LiveSessionCard';
import { Card, CardContent } from '../ui/Card';
import { Calendar, Clock } from 'lucide-react';

interface UpcomingEventsProps {
  events: LiveSession[];
  title?: string;
}

export function UpcomingEvents({ events, title = "Upcoming Events" }: UpcomingEventsProps) {
  if (!events || events.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">{title}</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No Upcoming Events
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Events will appear here once communities schedule them
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Check back later for community events</span>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">{title}</h2>
      <div className="space-y-4">
        {events.slice(0, 3).map((event) => (
          <LiveSessionCard key={event.id} session={event} />
        ))}
      </div>
      {/* Optional: Add a "View All Events" link here later */}
    </section>
  );
} 