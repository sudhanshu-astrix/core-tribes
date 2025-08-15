import { Users, Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { formatCompactNumber } from '../../lib/utils';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  logo: string;
  tags: string[];
  isPrivate: boolean;
}

interface CommunityCardProps {
  community: Community;
  onClick: () => void;
}

export function CommunityCard({ community, onClick }: CommunityCardProps) {
  return (
    <Card
      className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar
            src={community.logo}
            alt={community.name}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold truncate">{community.name}</h3>
              {community.isPrivate && (
                <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {community.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{formatCompactNumber(community.memberCount)} members</span>
          </div>
          <span>{community.category}</span>
        </div>

        {/* Tags */}
        {community.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {community.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {community.tags.length > 3 && (
              <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                +{community.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 