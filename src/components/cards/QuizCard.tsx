import React, { useState } from 'react';
import { BookOpen, Users, Clock, CheckCircle, Trophy, User, Trash2, Eye, Brain, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { QuizDetails, QuizQuestion } from '../../services/ContentManager';
import { useWalletStore } from '../../store/walletStore';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
  quiz: QuizDetails;
  tribeId: number;
  onQuizUpdated?: () => void;
  onQuizDeleted?: (postId: number) => void;
  isOwner?: boolean;
  isMember?: boolean;
  showExploreButton?: boolean; // Whether to show the explore tribe button
}

export function QuizCard({ quiz, tribeId, onQuizUpdated, onQuizDeleted, isOwner, isMember, showExploreButton = true }: QuizCardProps) {
  const { address } = useWalletStore();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userResult, setUserResult] = useState<{ score: number; completed: boolean } | null>(null);

  const isExpired = new Date(quiz.endTime * 1000) < new Date();
  const hasUserParticipated = quiz.participants.some(p => p.participant.toLowerCase() === address?.toLowerCase());
  const userParticipant = quiz.participants.find(p => p.participant.toLowerCase() === address?.toLowerCase());

  // Initialize answers array
  React.useEffect(() => {
    if (quiz.questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(quiz.questions.length).fill(''));
    }
  }, [quiz.questions.length, answers.length]);

  // Load user result
  React.useEffect(() => {
    const loadUserResult = async () => {
      if (!address) return;

      try {
        const { contentManagerService } = await import('../../services/ContentManager');
        const result = await contentManagerService.getQuizResult(quiz.postId, address);
        setUserResult(result);
      } catch (error) {
        console.error('Failed to load user result:', error);
      }
    };

    loadUserResult();
  }, [address, quiz.postId]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswers = async () => {
    if (!address || answers.some(answer => !answer.trim())) {
      alert('Please answer all questions');
      return;
    }

    try {
      setIsSubmitting(true);
      const { contentManagerService } = await import('../../services/ContentManager');
      await contentManagerService.submitQuizAnswers(tribeId, quiz.postId, answers);
      
      if (onQuizUpdated) {
        onQuizUpdated();
      }
      
      alert('Quiz submitted successfully!');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { contentManagerService } = await import('../../services/ContentManager');
      await contentManagerService.deletePost(tribeId, quiz.postId);
      
      if (onQuizDeleted) {
        onQuizDeleted(quiz.postId);
      }
      
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getMaxScore = () => {
    return quiz.questions.length * quiz.pointsPerQuestion;
  };

  const getAverageScore = () => {
    if (quiz.participants.length === 0) return 0;
    const totalScore = quiz.participants.reduce((sum, p) => sum + p.score, 0);
    return Math.round(totalScore / quiz.participants.length);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          {/* Quiz Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Community Quiz
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created by {formatAddress(quiz.creator)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                quiz.isActive && !isExpired
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {quiz.isActive && !isExpired ? 'Active' : 'Ended'}
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

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-black dark:text-white">
                {quiz.questions.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Questions
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-black dark:text-white">
                {quiz.pointsPerQuestion}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Points per Q
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-black dark:text-white">
                {quiz.participants.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Participants
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-black dark:text-white">
                {getAverageScore()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Avg Score
              </div>
            </div>
          </div>

          {/* User Result Display */}
          {hasUserParticipated && userParticipant && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-400">
                    Your Result
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-800 dark:text-green-400">
                    {userParticipant.score}/{getMaxScore()} points
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-500">
                    {Math.round((userParticipant.score / getMaxScore()) * 100)}% correct
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Questions (if not participated and quiz is active) */}
          {isMember !== false && !hasUserParticipated && quiz.isActive && !isExpired && (
            <div className="space-y-4 mb-4">
              <h4 className="font-semibold text-black dark:text-white">
                Answer the following questions:
              </h4>
              
              {quiz.questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-black dark:text-white">
                    Question {index + 1}: {question}
                  </label>
                  <input
                    type="text"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quiz Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{quiz.participants.length} participants</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired 
                    ? 'Ended' 
                    : `Ends ${new Date(quiz.endTime * 1000).toLocaleDateString()}`
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
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explore Tribe
                </Button>
              ) : (
                // Member - show quiz options
                <>
                  {/* View Participants Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowParticipantsModal(true)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Results</span>
                  </Button>

                  {/* Submit Answers Button */}
                  {!hasUserParticipated && quiz.isActive && !isExpired && (
                    <Button
                      onClick={handleSubmitAnswers}
                      disabled={isSubmitting || answers.some(answer => !answer.trim())}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Submit Answers
                    </Button>
                  )}

                  {/* Already Participated Message */}
                  {hasUserParticipated && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Modal */}
      <Modal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        title="Quiz Results"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-semibold text-black dark:text-white">
                Total Participants: {quiz.participants.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Score: {getAverageScore()}/{getMaxScore()} points
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {getMaxScore()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Max Points
              </div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <h4 className="font-semibold text-black dark:text-white mb-2">
              Participant Results
            </h4>
            
            {quiz.participants.length > 0 ? (
              <div className="space-y-2">
                {quiz.participants
                  .sort((a, b) => b.score - a.score) // Sort by score descending
                  .map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-black dark:text-white">
                            {formatAddress(participant.participant)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {Math.round((participant.score / getMaxScore()) * 100)}% correct
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-black dark:text-white">
                          {participant.score} pts
                        </div>
                        {participant.completed && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No participants yet.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
} 