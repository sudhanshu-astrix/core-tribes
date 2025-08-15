import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, BarChart3, Calendar, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TribeDetails } from '../../services/TribeContract';

interface ParsedMetadata {
  description: string;
  logo: string;
  banner: string;
  category: string;
  guidelines: string;
  tags: string[];
}

interface UserTribeCardProps {
  tribe: TribeDetails;
  tribeId: number;
  parsedMetadata: ParsedMetadata;
  className?: string;
}

export function UserTribeCard({ tribe, tribeId, parsedMetadata, className = '' }: UserTribeCardProps) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close actions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  // Safety check for tribe data
  if (!tribe) {
    return (
      <Card className={`p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Invalid tribe data
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg border-none transition-shadow duration-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 flex items-center justify-center">
            <span className="text-black font-bold text-lg">
              {tribe.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white text-lg">
              {tribe.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {parsedMetadata.category}
            </p>
          </div>
        </div>
        <div className="relative" ref={actionsRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 rounded-lg shadow-lg z-10 min-w-[200px]">
              <div className="p-2">
                <Link to={`/tribe/${tribeId}/post/create`}>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-lightCard/50 dark:hover:bg-darkCard/50 cursor-pointer">
                    <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-black dark:text-white">Create Post</span>
                  </div>
                </Link>
                <Link to={`/tribe/${tribeId}/poll/create`}>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-lightCard/50 dark:hover:bg-darkCard/50 cursor-pointer">
                    <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-black dark:text-white">Create Poll</span>
                  </div>
                </Link>
                <Link to={`/tribe/${tribeId}/event/create`}>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-lightCard/50 dark:hover:bg-darkCard/50 cursor-pointer">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-black dark:text-white">Create Event</span>
                  </div>
                </Link>
                <Link to={`/tribe/${tribeId}/members`}>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-lightCard/50 dark:hover:bg-darkCard/50 cursor-pointer">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-black dark:text-white">View Members</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
        {parsedMetadata.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{tribe.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {parsedMetadata.tags && parsedMetadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {parsedMetadata.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-lightCard/50 dark:bg-darkCard/50 text-xs rounded-full text-gray-600 dark:text-gray-400 border border-lightCard/50 dark:border-darkCard/50"
            >
              {tag}
            </span>
          ))}
          {parsedMetadata.tags.length > 3 && (
            <span className="px-2 py-1 bg-lightCard/50 dark:bg-darkCard/50 text-xs rounded-full text-gray-600 dark:text-gray-400 border border-lightCard/50 dark:border-darkCard/50">
              +{parsedMetadata.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-between items-center mt-auto">
        <Link to={`/community/${tribeId}`} className="flex-1">
          <Button 
            className="w-full flex items-center justify-center space-x-2"
                          style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 6 }}
          >
            <Eye className="w-4 h-4" />
            <span>View Tribe</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
} 