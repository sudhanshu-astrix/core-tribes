import React from 'react';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  voteCount: number;
  onVote: (id: string) => void;
  onView: (id: string) => void;
}

const STATUS_COLORS = {
  active: 'bg-blue-500/10 text-blue-500',
  passed: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  executed: 'bg-gray-500/10 text-gray-500'
};

export function ProposalCard({
  id,
  title,
  description,
  status,
  voteCount,
  onVote,
  onView
}: ProposalCardProps) {
  const isActive = status === 'active';
  const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.executed;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
            {status}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description.length > 120
            ? `${description.substring(0, 120)}...`
            : description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {voteCount} votes
          </span>
          
          <div className="flex gap-2">
            {isActive ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onVote(id)}
              >
                Vote
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView(id)}
              >
                View
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 