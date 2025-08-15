import { Link } from 'react-router-dom';
import { ExternalLink, Users, Globe } from 'lucide-react';
import { Community } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { formatCompactNumber } from '../../lib/utils';

interface TrendingCommunitiesProps {
  communities: Community[];
  className?: string;
}

export function TrendingCommunities({ communities, className }: TrendingCommunitiesProps) {
  // Sort communities by member count, descending
  const sortedCommunities = [...communities].sort((a, b) => b.memberCount - a.memberCount).slice(0, 5);
  
  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="font-semibold text-black dark:text-white">Trending Communities</h2>
      </CardHeader>
      <CardContent className="p-0">
        {communities.length === 0 ? (
          // Empty state
          <div className="p-6 text-center">
            <Globe className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-black dark:text-white mb-1">
              No Communities Yet
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Communities will appear here once they're created
            </p>
            <Link
              to="/communities/create"
              className="inline-flex items-center gap-2 text-xs text-[#BBF10A] dark:text-[#BBF10A] hover:underline"
            >
              <Users className="h-3 w-3" />
              Create First Community
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-lightCard/30 dark:divide-darkCard/30">
            {sortedCommunities.map((community) => (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="flex items-center justify-between p-4 hover:bg-lightCardHover dark:hover:bg-darkCardHover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={community.logo}
                    fallback={community.name}
                    size="sm"
                  />
                  <div>
                    <span className="font-medium text-black dark:text-white">
                      {community.name}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCompactNumber(community.memberCount)} members
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}