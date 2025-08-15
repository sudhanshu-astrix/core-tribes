import React, { useState } from 'react';
import { Vote, Plus, X, Image as ImageIcon, Type, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { PollOption } from '../../services/ContentManager';

interface PollCreateFormProps {
  tribeId: number;
  onPollCreated?: (pollId: number) => void;
  onCancel?: () => void;
}

export function PollCreateForm({ tribeId, onPollCreated, onCancel }: PollCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', type: 'text' }
  ]);
  const [duration, setDuration] = useState('7');
  const [isCreating, setIsCreating] = useState(false);

  const durationOptions = [
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
  ];

  const addOption = () => {
    if (options.length < 6) { // Limit to 6 options
      setOptions([...options, { text: '', type: 'text' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) { // Keep at least 2 options
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'text' | 'type', value: string) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index].text = value;
    } else if (field === 'type') {
      newOptions[index].type = value as 'text' | 'image';
      if (value === 'image') {
        newOptions[index].image = '';
      } else {
        delete newOptions[index].image;
      }
    }
    setOptions(newOptions);
  };

  const updateImageUrl = (index: number, imageUrl: string) => {
    const newOptions = [...options];
    newOptions[index].image = imageUrl;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a poll title');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a poll description');
      return;
    }

    if (options.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    if (options.some(option => !option.text.trim())) {
      alert('Please fill in all option texts');
      return;
    }

    if (options.some(option => option.type === 'image' && !option.image?.trim())) {
      alert('Please provide image URLs for all image options');
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
      
      // Import the service here to avoid circular dependencies
      const { contentManagerService } = await import('../../services/ContentManager');
      const pollId = await contentManagerService.createPoll(
        tribeId,
        JSON.stringify(metadata),
        options,
        durationSeconds
      );

      // Reset form
      setTitle('');
      setDescription('');
      setOptions([{ text: '', type: 'text' }]);
      setDuration('7');

      if (onPollCreated) {
        onPollCreated(pollId);
      }

      alert('Poll created successfully!');
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll. Please try again.');
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Create New Poll
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an interactive poll for your community
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
              Poll Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear and engaging title for your poll"
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
              Poll Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and details about your poll..."
              className="w-full min-h-[100px]"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-black dark:text-white mb-2">
              Poll Duration
            </label>
            <Select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              options={durationOptions}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              How long should the poll be active?
            </p>
          </div>

          {/* Poll Options */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-black dark:text-white">
                Poll Options *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= 6}
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </Button>
            </div>

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-black dark:text-white">
                      Option {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={option.type}
                        onChange={(e) => updateOption(index, 'type', e.target.value)}
                        options={[
                          { value: 'text', label: 'Text' },
                          { value: 'image', label: 'Image' }
                        ]}
                        className="w-24"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={option.type === 'text' ? 'Enter option text...' : 'Enter option label...'}
                      className="w-full"
                      maxLength={100}
                      required
                    />

                    {option.type === 'image' && (
                      <div className="space-y-2">
                        <Input
                          type="url"
                          value={option.image || ''}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          placeholder="Enter image URL..."
                          className="w-full"
                          required
                        />
                        {option.image && (
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Image preview will be shown in the poll
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {options.length}/6 options (minimum 2 required)
            </p>
          </div>

          {/* Poll Preview */}
          {title && description && options.some(opt => opt.text.trim()) && (
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
                  <span className="text-sm font-medium text-black dark:text-white">Options:</span>
                  <div className="mt-2 space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {option.text || `Option ${index + 1}`}
                        </span>
                        {option.type === 'image' && (
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {durationOptions.find(opt => opt.value === duration)?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center space-x-2">
              <Vote className="w-4 h-4" />
              <span>Poll Guidelines</span>
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Keep questions clear and specific</li>
              <li>• Provide 2-6 meaningful options</li>
              <li>• Use images to make options more engaging</li>
              <li>• Set appropriate duration for your community</li>
              <li>• Polls cannot be edited once created</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isCreating || !title.trim() || !description.trim() || options.some(opt => !opt.text.trim())}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Vote className="w-4 h-4 mr-2" />
              )}
              Create Poll
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