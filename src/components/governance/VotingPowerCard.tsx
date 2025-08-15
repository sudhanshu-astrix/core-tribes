import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface VotingPowerCardProps {
  votingPower: number;
  delegatedTo?: {
    address: string;
    name: string;
    avatar?: string;
  };
  onDelegate?: () => void;
  onUndelegate?: () => void;
}

export function VotingPowerCard({
  votingPower,
  delegatedTo,
  onDelegate,
  onUndelegate
}: VotingPowerCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Voting Power
          </h3>
          <span className="text-2xl font-bold text-accent">
            {votingPower.toLocaleString()} TRIX
          </span>
        </div>

        {delegatedTo ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Delegated to
            </p>
            <div className="flex items-center gap-3">
              <Avatar
                src={delegatedTo.avatar}
                alt={delegatedTo.name}
                size="sm"
              />
              <div>
                <p className="font-medium text-black dark:text-white">
                  {delegatedTo.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {delegatedTo.address.slice(0, 6)}...{delegatedTo.address.slice(-4)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onUndelegate}
                className="ml-auto"
              >
                Undelegate
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your voting power is not delegated
            </p>
            <Button
              variant="primary"
              onClick={onDelegate}
            >
              Delegate Voting Power
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
} 