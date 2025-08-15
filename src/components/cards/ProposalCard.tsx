import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown, Eye, Loader2, Crown, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { votingService, ProposalWithId, ProposalStatus } from '../../services/VotingService';
import { useWalletStore } from '../../store/walletStore';

interface ProposalCardProps {
  proposal: ProposalWithId;
  onProposalUpdated?: () => void;
  isOwner?: boolean;
}

export function ProposalCard({ proposal, onProposalUpdated, isOwner = false }: ProposalCardProps) {
  const { address } = useWalletStore();
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const [voters, setVoters] = useState<string[]>([]);
  const [showConfirmVote, setShowConfirmVote] = useState(false);
  const [pendingVote, setPendingVote] = useState<boolean | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Load user's voting status
  useEffect(() => {
    const loadUserVoteStatus = async () => {
      if (!address) return;

      try {
        const voted = await votingService.hasVoted(proposal.proposalId, address);
        setHasVoted(voted);
        
        // If user has voted, we need to determine which way they voted
        // This would require additional contract calls or events to track
        // For now, we'll just show they've voted
        if (voted) {
          setUserVote(null); // We don't know which way they voted yet
        }
      } catch (error) {
        console.error('Failed to load user vote status:', error);
      }
    };

    loadUserVoteStatus();
  }, [address, proposal.proposalId]);

  // Load voters when modal is opened
  useEffect(() => {
    if (showVoters) {
      const loadVoters = async () => {
        try {
          const proposalVoters = await votingService.getProposalVoters(proposal.proposalId);
          setVoters(proposalVoters);
        } catch (error) {
          console.error('Failed to load voters:', error);
        }
      };
      loadVoters();
    }
  }, [showVoters, proposal.proposalId]);

  const handleVote = async (support: boolean) => {
    if (!address) {
      alert('Please connect your wallet to vote');
      return;
    }

    setPendingVote(support);
    setShowConfirmVote(true);
  };

  const confirmVote = async () => {
    if (!address || pendingVote === null) return;

    try {
      setIsVoting(true);
      await votingService.vote(proposal.proposalId, pendingVote);
      
      setHasVoted(true);
      setUserVote(pendingVote);
      setShowConfirmVote(false);
      setPendingVote(null);
      
      if (onProposalUpdated) {
        onProposalUpdated();
      }
      
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleExecuteProposal = async () => {
    if (!confirm('Are you sure you want to execute this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      setIsExecuting(true);
      await votingService.executeProposal(proposal.proposalId);
      
      if (onProposalUpdated) {
        onProposalUpdated();
      }
      
      alert('Proposal executed successfully!');
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      alert('Failed to execute proposal. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelProposal = async () => {
    if (!confirm('Are you sure you want to cancel this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      setIsCanceling(true);
      await votingService.cancelProposal(proposal.proposalId);
      
      if (onProposalUpdated) {
        onProposalUpdated();
      }
      
      alert('Proposal cancelled successfully!');
    } catch (error) {
      console.error('Failed to cancel proposal:', error);
      alert('Failed to cancel proposal. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusInfo = () => {
    switch (proposal.status) {
      case ProposalStatus.ACTIVE:
        return {
          icon: Clock,
          label: 'Active',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case ProposalStatus.PASSED:
        return {
          icon: CheckCircle,
          label: 'Passed',
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case ProposalStatus.REJECTED:
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case ProposalStatus.CANCELED:
        return {
          icon: AlertCircle,
          label: 'Canceled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;

  const isVotingActive = proposal.status === ProposalStatus.ACTIVE;
  const votingEnded = new Date(proposal.endTime * 1000) < new Date();
  const canExecute = isOwner && isVotingActive && votingEnded;
  const canCancel = isOwner && isVotingActive && !votingEnded;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                {proposal.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {proposal.description}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Voting Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Voting Results</span>
              <span>{totalVotes} total votes</span>
            </div>
            
            <div className="space-y-2">
              {/* For Votes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-black dark:text-white">For</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${forPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white w-12 text-right">
                    {proposal.forVotes} ({forPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Against Votes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-black dark:text-white">Against</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${againstPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white w-12 text-right">
                    {proposal.againstVotes} ({againstPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Started: {new Date(proposal.startTime * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Ends: {new Date(proposal.endTime * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>Creator: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>Voters: {voters.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {/* Show Voters Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoters(true)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Show Participants</span>
              </Button>

              {/* User Vote Status */}
              {hasVoted && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Voted</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Voting Buttons */}
              {isVotingActive && !hasVoted && address && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleVote(true)}
                    disabled={isVoting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isVoting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Vote For
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVote(false)}
                    disabled={isVoting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isVoting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Vote Against
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Admin Actions */}
              {canExecute && (
                <Button
                  size="sm"
                  onClick={handleExecuteProposal}
                  disabled={isExecuting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isExecuting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-1" />
                      Execute
                    </>
                  )}
                </Button>
              )}

              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelProposal}
                  disabled={isCanceling}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isCanceling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voters Modal */}
      <Modal
        isOpen={showVoters}
        onClose={() => setShowVoters(false)}
        title="Proposal Participants"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {voters.length} members participated in this proposal
          </p>
          
          {voters.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No votes cast yet
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {voters.map((voter, index) => (
                <div
                  key={voter}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {voter.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {voter.slice(0, 6)}...{voter.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Voter #{index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Vote Confirmation Modal */}
      <Modal
        isOpen={showConfirmVote}
        onClose={() => {
          setShowConfirmVote(false);
          setPendingVote(null);
        }}
        title="Confirm Your Vote"
      >
        <div className="space-y-4">
          <p className="text-black dark:text-white">
            Are you sure you want to vote{' '}
            <span className={`font-bold ${pendingVote ? 'text-green-600' : 'text-red-600'}`}>
              {pendingVote ? 'FOR' : 'AGAINST'}
            </span>{' '}
            this proposal?
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-black dark:text-white mb-2">
              {proposal.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {proposal.description}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Important:</strong> You cannot change your vote once it's cast.
          </p>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={confirmVote}
              disabled={isVoting}
              className={`flex-1 ${
                pendingVote 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isVoting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  {pendingVote ? <ThumbsUp className="w-4 h-4 mr-2" /> : <ThumbsDown className="w-4 h-4 mr-2" />}
                  Confirm Vote
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmVote(false);
                setPendingVote(null);
              }}
              disabled={isVoting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}