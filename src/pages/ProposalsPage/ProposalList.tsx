import React, { useState, useMemo } from 'react';
import { useFetchProposals } from './hooks/useFetchProposals';
import { ProposalCard } from './ProposalCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Vote, FileText, Search, Loader2 } from 'lucide-react';

interface ProposalListProps {
  onOpenGovernance: () => void;
  showGovernanceButton: boolean;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'funding', label: 'Funding' },
  { value: 'governance', label: 'Governance' },
  { value: 'events', label: 'Events' },
  { value: 'other', label: 'Other' }
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'passed', label: 'Passed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'executed', label: 'Executed' }
];

export function ProposalList({ onOpenGovernance, showGovernanceButton }: ProposalListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const { proposals, isLoading, error } = useFetchProposals();

  const filteredProposals = useMemo(() => {
    return proposals.filter(p =>
      (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
      (!category || p.category === category) &&
      (!status || p.status === status)
    );
  }, [proposals, search, category, status]);

  if (error) {
    return <div className="text-red-500">Error loading proposals: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => {}}>
            Create Proposal
          </Button>
          {showGovernanceButton && (
            <Button variant="secondary" onClick={onOpenGovernance}>
              Governance
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search proposals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          value={category}
          onChange={e => setCategory(e.target.value)}
          options={CATEGORIES}
          className="w-40"
        />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          options={STATUSES}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#BBF10A] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Loading Proposals
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching governance proposals...
          </p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            {search || category || status ? (
              // No search results
              <>
                <Search className="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No Proposals Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No proposals match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                    setStatus('');
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              // No proposals at all
              <>
                <Vote className="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No Proposals Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Proposals will appear here once communities start creating them
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FileText className="h-3 w-3" />
                  <span>Join communities to participate in governance</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              id={proposal.id}
              title={proposal.title}
              description={proposal.description}
              status={proposal.status}
              voteCount={proposal.totalVotes}
              onVote={() => {}}
              onView={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
} 