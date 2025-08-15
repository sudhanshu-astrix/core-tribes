import React, { useState } from 'react';
import { BookOpen, Plus, X, Trash2, Clock, Brain } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { QuizQuestion } from '../../services/ContentManager';

interface QuizCreateFormProps {
  tribeId: number;
  onQuizCreated?: (quizId: number) => void;
  onCancel?: () => void;
}

export function QuizCreateForm({ tribeId, onQuizCreated, onCancel }: QuizCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: '', answer: '' }
  ]);
  const [pointsPerQuestion, setPointsPerQuestion] = useState('10');
  const [duration, setDuration] = useState('3');
  const [isCreating, setIsCreating] = useState(false);

  const durationOptions = [
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
  ];

  const pointsOptions = [
    { value: '5', label: '5 points' },
    { value: '10', label: '10 points' },
    { value: '15', label: '15 points' },
    { value: '20', label: '20 points' },
    { value: '25', label: '25 points' },
  ];

  const addQuestion = () => {
    if (questions.length < 10) { // Limit to 10 questions
      setQuestions([...questions, { question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) { // Keep at least 1 question
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a quiz description');
      return;
    }

    if (questions.length < 1) {
      alert('Please add at least 1 question');
      return;
    }

    if (questions.some(q => !q.question.trim() || !q.answer.trim())) {
      alert('Please fill in all questions and answers');
      return;
    }

    try {
      setIsCreating(true);
      
      // Create metadata
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString()
      };

      // Convert duration to seconds
      const durationSeconds = parseInt(duration) * 24 * 60 * 60;
      const points = parseInt(pointsPerQuestion);
      
      // Import the service here to avoid circular dependencies
      const { contentManagerService } = await import('../../services/ContentManager');
      const quizId = await contentManagerService.createQuiz(
        tribeId,
        JSON.stringify(metadata),
        questions,
        points,
        durationSeconds
      );

      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([{ question: '', answer: '' }]);
      setPointsPerQuestion('10');
      setDuration('3');

      if (onQuizCreated) {
        onQuizCreated(quizId);
      }

      alert('Quiz created successfully!');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getMaxScore = () => {
    return questions.length * parseInt(pointsPerQuestion);
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Create New Quiz
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an educational quiz for your community
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
              Quiz Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear and engaging title for your quiz"
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
              Quiz Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and details about your quiz..."
              className="w-full min-h-[100px]"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pointsPerQuestion" className="block text-sm font-medium text-black dark:text-white mb-2">
                Points per Question
              </label>
              <Select
                id="pointsPerQuestion"
                value={pointsPerQuestion}
                onChange={(e) => setPointsPerQuestion(e.target.value)}
                options={pointsOptions}
                className="w-full"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Points awarded for each correct answer
              </p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-black dark:text-white mb-2">
                Quiz Duration
              </label>
              <Select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={durationOptions}
                className="w-full"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                How long should the quiz be active?
              </p>
            </div>
          </div>

          {/* Quiz Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-black dark:text-white">
                Quiz Questions *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                disabled={questions.length >= 10}
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-black dark:text-white">
                      Question {index + 1}
                    </span>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-1">
                        Question
                      </label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Enter your question..."
                        className="w-full min-h-[80px]"
                        maxLength={200}
                        required
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {question.question.length}/200 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-1">
                        Correct Answer
                      </label>
                      <Input
                        type="text"
                        value={question.answer}
                        onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                        placeholder="Enter the correct answer..."
                        className="w-full"
                        maxLength={100}
                        required
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {question.answer.length}/100 characters
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {questions.length}/10 questions (minimum 1 required)
            </p>
          </div>

          {/* Quiz Stats */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-black dark:text-white mb-3">Quiz Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-black dark:text-white">
                  {questions.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Questions
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black dark:text-white">
                  {pointsPerQuestion}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Points per Q
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black dark:text-white">
                  {getMaxScore()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Max Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black dark:text-white">
                  {durationOptions.find(opt => opt.value === duration)?.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Duration
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Preview */}
          {title && description && questions.some(q => q.question.trim() && q.answer.trim()) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-black dark:text-white mb-3">Preview</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-black dark:text-white">Title:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-black dark:text-white">Description:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {description}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-black dark:text-white">Questions:</span>
                  <div className="mt-2 space-y-2">
                    {questions.map((q, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {q.question || `Question ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2 flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Quiz Guidelines</span>
            </h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Keep questions clear and educational</li>
              <li>• Provide 1-10 meaningful questions</li>
              <li>• Use specific and accurate answers</li>
              <li>• Set appropriate points and duration</li>
              <li>• Quizzes cannot be edited once created</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isCreating || !title.trim() || !description.trim() || questions.some(q => !q.question.trim() || !q.answer.trim())}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              Create Quiz
            </Button>
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 