import React, { useState } from 'react';
import { Vote, Users, Clock, CheckCircle, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PollDetails, PollOption } from '../../services/ContentManager';
import { useWalletStore } from '../../store/walletStore';
import { useNavigate } from 'react-router-dom';

interface PollCardProps {
  poll: PollDetails;
  tribeId: number;
  onPollUpdated?: () => void;
  onPollDeleted?: (postId: number) => void;
  isOwner?: boolean;
  isMember?: boolean;
  showExploreButton?: boolean; // Whether to show the explore tribe button
}

export function PollCard({ poll, tribeId, onPollUpdated, onPollDeleted, isOwner, isMember, showExploreButton = true }: PollCardProps) {
  const { address } = useWalletStore();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse poll options to handle text/image format
  const parsePollOptions = (options: string[]): PollOption[] => {
    return options.map(option => {
      if (option.includes('|')) {
        const [text, image] = option.split('|');
        return { text, image, type: 'image' as const };
      }
      return { text: option, type: 'text' as const };
    });
  };

  const pollOptions = parsePollOptions(poll.options);
  const totalVotes = poll.voteCounts.reduce((sum, count) => sum + count, 0);
  const isExpired = new Date(poll.endTime * 1000) < new Date();
  const hasUserVoted = poll.votersPerOption.some(voters => voters.includes(address || ''));
  const userVotedOption = poll.votersPerOption.findIndex(voters => voters.includes(address || ''));

  const handleVote = async () => {
    if (!address || selectedOption === null) return;

    try {
      setIsVoting(true);
      // Import the service here to avoid circular dependencies
      const { contentManagerService } = await import('../../services/ContentManager');
      await contentManagerService.submitPollVote(tribeId, poll.postId, selectedOption);
      
      if (onPollUpdated) {
        onPollUpdated();
      }
      
      alert('Vote submitted successfully!');
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { contentManagerService } = await import('../../services/ContentManager');
      await contentManagerService.deletePost(tribeId, poll.postId);
      
      if (onPollDeleted) {
        onPollDeleted(poll.postId);
      }
      
      alert('Poll deleted successfully!');
    } catch (error) {
      console.error('Failed to delete poll:', error);
      alert('Failed to delete poll. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          {/* Poll Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Community Poll
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created by {formatAddress(poll.creator)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                poll.isActive && !isExpired
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {poll.isActive && !isExpired ? 'Active' : 'Ended'}
              </div>
              
              {/* Delete Button for Owner */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Poll Options */}
          <div className="space-y-3 mb-4">
            {pollOptions.map((option, index) => {
              const votes = poll.voteCounts[index];
              const percentage = getVotePercentage(votes);
              const isSelected = selectedOption === index;
              const isUserVoted = userVotedOption === index;
              const isDisabled = hasUserVoted || !poll.isActive || isExpired;

              return (
                <div key={index} className="relative">
                  {option.type === 'image' ? (
                    // Image option layout (horizontal)
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={option.image}
                          alt={option.text}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-black dark:text-white">
                            {option.text}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {votes} votes ({percentage}%)
                            </span>
                            {isUserVoted && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Text option layout (vertical)
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-black dark:text-white">
                          {option.text}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {votes} votes ({percentage}%)
                          </span>
                          {isUserVoted && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Vote Button */}
                  {isMember !== false && !hasUserVoted && poll.isActive && !isExpired && (
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedOption(index)}
                      className={`mt-2 ${isSelected ? 'bg-blue-500 text-white' : ''}`}
                    >
                      {isSelected ? 'Selected' : 'Vote'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Poll Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{totalVotes} total votes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired 
                    ? 'Ended' 
                    : `Ends ${new Date(poll.endTime * 1000).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Show different actions based on membership */}
              {isMember === false && showExploreButton ? (
                // Not a member - show explore tribe button
                <Button
                  onClick={() => navigate(`/community/${tribeId}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explore Tribe
                </Button>
              ) : (
                // Member - show voting options
                <>
                  {/* Submit Vote Button */}
                  {!hasUserVoted && poll.isActive && !isExpired && selectedOption !== null && (
                    <Button
                      onClick={handleVote}
                      disabled={isVoting}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isVoting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Vote className="w-4 h-4 mr-2" />
                      )}
                      Submit Vote
                    </Button>
                  )}

                  {/* Already Voted Message */}
                  {hasUserVoted && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Voted</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 