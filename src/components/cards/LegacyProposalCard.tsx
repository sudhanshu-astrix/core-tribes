import { useState } from 'react';
import { Vote, Clock, User, CheckCircle, XCircle, MinusCircle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Proposal } from '../../types';

interface LegacyProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: string, vote: 'for' | 'against' | 'abstain') => void;
}

export function LegacyProposalCard({ proposal, onVote }: LegacyProposalCardProps) {
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(proposal.userVote || null);
  const [hasVoted, setHasVoted] = useState(!!proposal.userVote);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatEndDate = (dateString: string) => {
    const endDate = new Date(dateString);
    const now = new Date();
    const diffInMs = endDate.getTime() - now.getTime();
    
    if (diffInMs <= 0) return 'Ended';
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) return `${diffInDays}d left`;
    if (diffInHours > 0) return `${diffInHours}h left`;
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes}m left`;
  };

  const handleVote = () => {
    if (!selectedVote || hasVoted || proposal.status !== 'active') return;
    
    setHasVoted(true);
    onVote?.(proposal.id, selectedVote);
  };

  const getVotePercentage = (votes: number) => {
    if (proposal.totalVotes === 0) return 0;
    return Math.round((votes / proposal.totalVotes) * 100);
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'passed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'executed':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getQuorumStatus = () => {
    const quorumReached = proposal.totalVotes >= 100; // Assuming quorum is 100
    const minVotesReached = proposal.totalVotes >= 50; // Assuming min votes is 50
    
    if (quorumReached && minVotesReached) {
      return { reached: true, text: 'Quorum reached', color: 'text-green-500' };
    } else if (minVotesReached) {
      return { reached: false, text: 'Min votes reached', color: 'text-[#BBF10A]' };
    } else {
      return { reached: false, text: 'Insufficient votes', color: 'text-red-500' };
    }
  };

  const quorumStatus = getQuorumStatus();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70">
            <div className="w-full h-full flex items-center justify-center text-black font-bold">
              {proposal.community?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-black dark:text-white">
                {proposal.community?.name || 'Unknown Community'}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                in {proposal.community?.name || 'Unknown Community'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(proposal.endTime)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
          {proposal.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {proposal.description}
        </p>

        {/* Voting Results */}
        <div className="space-y-3">
          {proposal.options?.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
              <div className="flex items-center space-x-2">
                {option.text.toLowerCase().includes('yes') ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : option.text.toLowerCase().includes('no') ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <MinusCircle className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-medium text-black dark:text-white">{option.text}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-black dark:text-white">
                  {option.votes} ({option.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting Actions */}
      {proposal.status === 'active' && !hasVoted && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
          <h4 className="font-medium text-black dark:text-white mb-3">Cast Your Vote</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedVote === 'for' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVote('for')}
              className={selectedVote === 'for' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              For
            </Button>
            <Button
              variant={selectedVote === 'against' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVote('against')}
              className={selectedVote === 'against' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Against
            </Button>
            <Button
              variant={selectedVote === 'abstain' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVote('abstain')}
              className={selectedVote === 'abstain' ? 'bg-gray-500 hover:bg-gray-600' : ''}
            >
              <MinusCircle className="w-4 h-4 mr-1" />
              Abstain
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Vote className="w-4 h-4" />
            <span>{proposal.totalVotes} total votes</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span className={quorumStatus.color}>{quorumStatus.text}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatEndDate(proposal.endTime)}</span>
          </div>
        </div>
        
        {proposal.status === 'active' && !hasVoted && (
          <Button
            onClick={handleVote}
            disabled={!selectedVote}
            className="group transition-all duration-200 hover:scale-105"
                          style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 12 }}
          >
            <Vote className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            Submit Vote
          </Button>
        )}
        
        {hasVoted && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Voted</span>
          </div>
        )}
      </div>
    </Card>
  );
} 