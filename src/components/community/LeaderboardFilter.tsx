import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { getLeaderboard, type TimeFrame } from '../../services/LeaderboardService';
import { mockUser } from '../../data/mockData';
import { formatCompactNumber } from '../../lib/utils';

interface LeaderboardFilterProps {
  communityId: string;
  className?: string;
}

export function LeaderboardFilter({ communityId, className }: LeaderboardFilterProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time');
  const leaderboard = getLeaderboard(communityId, timeFrame);

  const timeFrameOptions: { label: string; value: TimeFrame }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'All Time', value: 'all-time' },
  ];

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white">Leaderboard</h2>
          <div className="flex gap-3">
            {timeFrameOptions.map(option => (
              <Button
                key={option.value}
                variant={timeFrame === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeFrame(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-lightCard/30 dark:border-darkCard/30">
                <th className="py-3 px-4 text-left font-semibold">#</th>
                <th className="py-3 px-4 text-left font-semibold">User</th>
                <th className="py-3 px-4 text-left font-semibold">Level</th>
                <th className="py-3 px-4 text-left font-semibold">XP</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === mockUser.id;
                return (
                  <tr
                    key={entry.userId}
                    className={`border-b border-lightCard/20 dark:border-darkCard/20 ${
                      isCurrentUser ? 'bg-[#BBF10A]/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={mockUser.avatar} fallback={mockUser.username} size="sm" />
                        <span>{mockUser.username}</span>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded bg-[#BBF10A] text-xs text-black">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">Level {entry.level}</td>
                    <td className="py-3 px-4">{formatCompactNumber(entry.xp)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(entry.actions).map(([action, count]) => (
                          <span
                            key={action}
                            className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded text-xs"
                          >
                            {action}: {count}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 