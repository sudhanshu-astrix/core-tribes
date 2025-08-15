import { useState } from 'react';
import { Vote, Calendar, Clock, Loader2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { votingService } from '../../services/VotingService';
import { useWalletStore } from '../../store/walletStore';

interface ProposalCreateFormProps {
  tribeId: number;
  onProposalCreated?: (proposalId: number) => void;
  onCancel?: () => void;
}

export function ProposalCreateForm({ tribeId, onProposalCreated, onCancel }: ProposalCreateFormProps) {
  const { address } = useWalletStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [votingPeriod, setVotingPeriod] = useState('7');
  const [isCreating, setIsCreating] = useState(false);

  const votingPeriodOptions = [
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet to create a proposal');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a proposal title');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a proposal description');
      return;
    }

    try {
      setIsCreating(true);
      
      // Convert voting period to seconds
      const votingPeriodSeconds = parseInt(votingPeriod) * 24 * 60 * 60;
      
      const proposalId = await votingService.createProposal(
        tribeId,
        title.trim(),
        description.trim(),
        votingPeriodSeconds
      );

      // Reset form
      setTitle('');
      setDescription('');
      setVotingPeriod('7');

      if (onProposalCreated) {
        onProposalCreated(proposalId);
      }

      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-xl flex items-center justify-center">
              <Vote className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Create New Proposal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submit a proposal for community voting
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-black dark:text-white mb-2">
              Proposal Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear and concise title for your proposal"
              className="w-full"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black dark:text-white mb-2">
              Proposal Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your proposal, including the rationale, expected outcomes, and any relevant details..."
              className="w-full min-h-[120px]"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Voting Period */}
          <div>
            <label htmlFor="votingPeriod" className="block text-sm font-medium text-black dark:text-white mb-2">
              Voting Period
            </label>
            <Select
              id="votingPeriod"
              value={votingPeriod}
              onChange={(e) => setVotingPeriod(e.target.value)}
              options={votingPeriodOptions}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              How long should the voting period last?
            </p>
          </div>

          {/* Proposal Preview */}
          {title && description && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-black dark:text-white mb-2">Preview</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-black dark:text-white">Title:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-black dark:text-white">Description:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {description}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Voting Period: {votingPeriodOptions.find(opt => opt.value === votingPeriod)?.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Created by: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center space-x-2">
              <Vote className="w-4 h-4" />
              <span>Proposal Guidelines</span>
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Be clear and specific about what you're proposing</li>
              <li>• Explain the rationale and expected benefits</li>
              <li>• Consider the impact on the community</li>
              <li>• Proposals cannot be edited once submitted</li>
              <li>• Only active tribe members can vote</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isCreating || !title.trim() || !description.trim()}
              className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-accentBlue/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Proposal...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 