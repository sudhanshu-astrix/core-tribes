import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Image as ImageIcon, Users, DollarSign, Lock, Globe, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { EventMetadata, EventDetails, eventTicketsService } from '../../services/EventTicketsService';
import { uploadFiles } from '../../services/BackendService';
import { useWalletStore } from '../../store/walletStore';

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (eventId: number) => void;
  onEventUpdated?: () => void;
  tribeId: number;
  tribeName: string;
  editingEvent?: EventDetails | null;
}

const EVENT_CATEGORIES = [
  'Art & Culture',
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Health & Wellness',
  'Sports',
  'Music',
  'Food & Drink',
  'Community',
  'Other'
];

export const EventCreateModal: React.FC<EventCreateModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  onEventUpdated,
  tribeId,
  tribeName,
  editingEvent
}) => {
  const { address } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    category: string;
    maxTickets: number;
    price: string;
    isPrivate: boolean;
    maxCapacity: number;
  }>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'Other',
    maxTickets: 100,
    price: '0',
    isPrivate: false,
    maxCapacity: 1 // Fixed to 1 ticket per user
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Initialize form with editing event data
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.metadata.title,
        description: editingEvent.metadata.description,
        date: editingEvent.metadata.date.split('T')[0],
        startTime: editingEvent.metadata.startTime.split('T')[1].substring(0, 5),
        endTime: editingEvent.metadata.endTime.split('T')[1].substring(0, 5),
        location: editingEvent.metadata.location,
        category: editingEvent.metadata.category,
        maxTickets: editingEvent.maxTickets,
        price: (parseFloat(editingEvent.price) / 1e18).toString(),
        isPrivate: editingEvent.isPrivate,
        maxCapacity: 1 // Always 1 for new events
      });
      setImageUrl(editingEvent.metadata.image);
      setImagePreview(editingEvent.metadata.image);
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        category: 'Other',
        maxTickets: 100,
        price: '0',
        isPrivate: false,
        maxCapacity: 1 // Fixed to 1 ticket per user
      });
      setImageFile(null);
      setImagePreview('');
      setImageUrl('');
    }
  }, [editingEvent, isOpen]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUploading(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload image immediately
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await uploadFiles(formData, 'tribes', 'tribes');
        
        if (response && response.status) {
          // Use the new response format
          const uploadedUrl = response.content.uploadedUrl;
          setImageUrl(uploadedUrl);
          setImagePreview(uploadedUrl); // Update preview with actual uploaded URL
          console.log('Image uploaded successfully:', uploadedUrl);
        } else {
          throw new Error(response.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
        // Reset the file and preview on error
        setImageFile(null);
        setImagePreview('');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const validateForm = (): string | null => {
    // Skip validation for update mode
    if (editingEvent) {
      return null;
    }
    
    if (!formData.title.trim()) return 'Event title is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.date) return 'Event date is required';
    if (!formData.startTime) return 'Start time is required';
    if (!formData.endTime) return 'End time is required';
    if (!formData.location.trim()) return 'Event location is required';
    if (formData.maxTickets <= 0) return 'Maximum tickets must be greater than 0';
    // maxCapacity is fixed to 1, no validation needed
    
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    const now = new Date();

    if (startDateTime <= now) return 'Event start time must be in the future';
    if (endDateTime <= startDateTime) return 'End time must be after start time';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Use the already uploaded image URL
      const finalImageUrl = imageUrl || '';

      // Create metadata
      const metadata: EventMetadata = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: `${formData.date}T${formData.startTime}`,
        location: formData.location.trim(),
        image: finalImageUrl,
        category: formData.category,
        maxCapacity: formData.maxCapacity,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`
      };

      if (editingEvent) {
        // Update existing event (this would require contract support for updates)
        // For now, we'll just show a message
        alert('Event updates are not yet supported in the contract. Please cancel and recreate the event.');
        onClose();
      } else {
        // Create new event
        const eventId = await eventTicketsService.createEvent(
          tribeId,
          metadata,
          formData.maxTickets,
          formData.price,
          formData.isPrivate
        );

        console.log('Event created successfully with ID:', eventId);
        onEventCreated?.(eventId);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (editingEvent) {
      try {
        setIsLoading(true);
        await eventTicketsService.cancelEvent(editingEvent.eventId);
        onEventUpdated?.();
        onClose();
      } catch (error) {
        console.error('Failed to cancel event:', error);
        alert(`Failed to cancel event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  options={EVENT_CATEGORIES.map(category => ({
                    value: category,
                    label: category
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Event location"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Date & Time</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={editingEvent ? undefined : new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Ticket Configuration */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Ticket Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Tickets *
                </label>
                <Input
                  type="number"
                  value={formData.maxTickets}
                  onChange={(e) => handleInputChange('maxTickets', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (XDC)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0 for free"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Capacity Per User
                </label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400">1 ticket per user (fixed)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isPrivate}
                  onChange={(checked) => handleInputChange('isPrivate', checked)}
                  disabled={formData.price !== '0'}
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Private Event (Requires Approval)
                </label>
              </div>
              
              {formData.price !== '0' && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Globe className="w-4 h-4" />
                  <span>Paid events are always public</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Event Image</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={imageUploading}
                  className="flex items-center space-x-2"
                >
                  {imageUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  <span>{imageUploading ? 'Uploading...' : (imageUrl ? 'Change Image' : 'Upload Image')}</span>
                </Button>
                
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-48 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            {editingEvent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Event'}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || imageUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {editingEvent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingEvent ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 