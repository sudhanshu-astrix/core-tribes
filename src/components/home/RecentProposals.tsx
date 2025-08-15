import { Proposal } from '../../types';
import { LegacyProposalCard } from '../cards/LegacyProposalCard';
import { Card, CardContent } from '../ui/Card';
import { Vote, FileText } from 'lucide-react';

interface RecentProposalsProps {
  proposals: Proposal[];
  title?: string;
}

export function RecentProposals({ proposals, title = "Recent Proposals" }: RecentProposalsProps) {
  if (!proposals || proposals.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">{title}</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Vote className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No Recent Proposals
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Proposals will appear here once communities start creating them
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <FileText className="h-3 w-3" />
              <span>Join communities to participate in governance</span>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">{title}</h2>
      <div className="space-y-4">
        {proposals.slice(0, 3).map((proposal) => (
          <LegacyProposalCard 
            key={proposal.id} 
            proposal={proposal}
          />
        ))}
      </div>
      {/* Optional: Add a "View All Proposals" link here later */}
    </section>
  );
} 