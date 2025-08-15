import React from 'react';
import { Card } from '../ui/Card';

interface ProposalStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  averageParticipation: number;
  totalVotingPower: number;
}

interface ProposalAnalyticsProps {
  stats: ProposalStats;
}

export function ProposalAnalytics({ stats }: ProposalAnalyticsProps) {
  const StatCard = ({ title, value, description }: { title: string; value: string | number; description?: string }) => (
    <Card className="p-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h4>
      <p className="text-2xl font-bold text-black dark:text-white mt-1">
        {value}
      </p>
      {description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </Card>
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
        Proposal Analytics
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Proposals"
          value={stats.totalProposals}
        />
        <StatCard
          title="Active Proposals"
          value={stats.activeProposals}
        />
        <StatCard
          title="Passed Proposals"
          value={stats.passedProposals}
        />
        <StatCard
          title="Rejected Proposals"
          value={stats.rejectedProposals}
        />
        <StatCard
          title="Average Participation"
          value={`${stats.averageParticipation}%`}
          description="of total voting power"
        />
        <StatCard
          title="Total Voting Power"
          value={`${stats.totalVotingPower.toLocaleString()} TRIX`}
          description="across all proposals"
        />
      </div>
    </Card>
  );
} 