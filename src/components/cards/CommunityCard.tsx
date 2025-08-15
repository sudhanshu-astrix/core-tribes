import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Community } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { formatCompactNumber } from '../../lib/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface CommunityCardProps {
  community: Community;
  className?: string;
}

export function CommunityCard({ community, className }: CommunityCardProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(community.memberCount);
  
  const handleJoinToggle = () => {
    if (isJoined) {
      setIsJoined(false);
      setMemberCount(memberCount - 1);
    } else {
      setIsJoined(true);
      setMemberCount(memberCount + 1);
    }
  };
  
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 500 }}>
      <Link to={`/community/${community.id}`} className="block group focus:outline-none">
        <Card className={className + ' group-hover:shadow-lg cursor-pointer transition-shadow'}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar
                src={community.logo}
                alt={community.name}
                size="xl"
                className="mb-3"
                fallback={community.name}
              />
              <h3 className="font-semibold text-black dark:text-white">
                {community.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <Users className="h-3 w-3" />
                <span>{formatCompactNumber(memberCount)} members</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {community.description}
            </p>
            
            <Button
              variant={isJoined ? "outline" : "primary"}
              size="sm"
              className="w-full"
              onClick={e => { e.preventDefault(); handleJoinToggle(); }}
            >
              {isJoined ? 'Leave' : 'Join'}
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}