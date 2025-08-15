import { motion } from 'framer-motion';
import { Users, Calendar, Clock, Video, Mic, MessageSquare } from 'lucide-react';
import { LiveSession } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { formatEventDate } from '../../lib/utils';

interface LiveSessionCardProps {
  session: LiveSession;
  className?: string;
}

export function LiveSessionCard({ session, className }: LiveSessionCardProps) {
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={session.community.logo}
              fallback={session.community.name}
              size="sm"
            />
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                {session.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hosted by {session.host.username}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Copy Link
            </Button>
            <Button variant="primary" size="sm">
              Event Page
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#BBF10A]" />
            <span className="text-black dark:text-white">
              {startTime.toLocaleDateString('default', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#BBF10A]" />
            <span className="text-black dark:text-white">
              {startTime.toLocaleTimeString('default', { 
                hour: '2-digit',
                minute: '2-digit'
              })} - {endTime.toLocaleTimeString('default', {
                hour: '2-digit',
                minute: '2-digit'
              })} GMT+4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#BBF10A]" />
            <span className="text-black dark:text-white">Virtual</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {session.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.participants} Going
            </span>
          </div>
          <Button variant="primary" size="sm">
            Add to Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}