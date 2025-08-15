import { mockCommunityMembers } from '../data/mockData';
import type { CommunityMember } from '../types';

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface LeaderboardEntry {
  userId: string;
  xp: number;
  level: number;
  rankName?: string;
  actions: {
    [key: string]: number;
  };
}

function getTimeFrameDates(timeFrame: TimeFrame): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (timeFrame) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'all-time':
      start = new Date(0); // Beginning of time
      break;
  }

  return { start, end };
}

function calculateXpInTimeFrame(member: CommunityMember, timeFrame: TimeFrame): number {
  if (!member.xpHistory) return 0;

  const { start, end } = getTimeFrameDates(timeFrame);
  
  return member.xpHistory
    .filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= start && timestamp <= end;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function getActionCounts(member: CommunityMember, timeFrame: TimeFrame): { [key: string]: number } {
  if (!member.xpHistory) return {};

  const { start, end } = getTimeFrameDates(timeFrame);
  
  return member.xpHistory
    .filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= start && timestamp <= end;
    })
    .reduce((counts, entry) => {
      counts[entry.action] = (counts[entry.action] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
}

export function getLeaderboard(communityId: string, timeFrame: TimeFrame = 'all-time'): LeaderboardEntry[] {
  const members = mockCommunityMembers.filter(m => m.communityId === communityId);
  
  return members
    .map(member => ({
      userId: member.userId,
      xp: calculateXpInTimeFrame(member, timeFrame),
      level: member.currentLevel,
      actions: getActionCounts(member, timeFrame),
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function getMemberStats(userId: string, communityId: string, timeFrame: TimeFrame = 'all-time'): {
  rank: number;
  xp: number;
  actions: { [key: string]: number };
} | null {
  const leaderboard = getLeaderboard(communityId, timeFrame);
  const memberEntry = leaderboard.find(entry => entry.userId === userId);
  
  if (!memberEntry) return null;
  
  return {
    rank: leaderboard.indexOf(memberEntry) + 1,
    xp: memberEntry.xp,
    actions: memberEntry.actions,
  };
} 