import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Image as ImageIcon, Users, DollarSign, Lock, Globe, Loader2, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { EventMetadata, eventTicketsService } from '../services/EventTicketsService';
import { uploadFiles } from '../services/BackendService';
import { useWalletStore } from '../store/walletStore';
import { tribeContractService } from '../services/TribeContract';

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

export function CreateEventPage() {
  const navigate = useNavigate();
  const { tribeId } = useParams<{ tribeId: string }>();
  const { address } = useWalletStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [tribeDetails, setTribeDetails] = useState<{ name: string; description: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
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
    maxCapacity: 5
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Initialize contracts and load tribe details
  useEffect(() => {
    const initializeContracts = async () => {
      try {
        // Initialize tribe contract service
        await tribeContractService.initialize();
        
        if (tribeId) {
          const tribeIdNum = parseInt(tribeId);
          
          // Check if tribe exists
          const exists = await tribeContractService.getTribeExists(tribeIdNum);
          if (!exists) {
            alert('Tribe not found');
            navigate('/communities');
            return;
          }

          // Get tribe details
          const details = await tribeContractService.getTribeDetails(tribeIdNum);
          setTribeDetails({
            name: details.name || 'Unknown Tribe',
            description: 'Create amazing events for your community'
          });

          // Check if user is owner using the admin property from tribe details
          if (address) {
            const isUserOwner = details.admin?.toLowerCase() === address.toLowerCase();
            setIsOwner(isUserOwner);
            
            if (!isUserOwner) {
              alert('Only tribe owners can create events');
              navigate(`/community/${tribeId}`);
              return;
            }
          }
        }

        // Initialize event tickets service
        await eventTicketsService.initialize();
      } catch (error) {
        console.error('Failed to initialize contracts:', error);
        alert('Failed to initialize. Please try again.');
        navigate('/communities');
      }
    };

    initializeContracts();
  }, [tribeId, address, navigate]);

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
          const uploadedUrl = response.content.uploadedUrl;
          setImageUrl(uploadedUrl);
          setImagePreview(uploadedUrl);
          console.log('Image uploaded successfully:', uploadedUrl);
        } else {
          throw new Error(response?.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
        setImageFile(null);
        setImagePreview('');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Event title is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.date) return 'Event date is required';
    if (!formData.startTime) return 'Start time is required';
    if (!formData.endTime) return 'End time is required';
    if (!formData.location.trim()) return 'Event location is required';
    if (formData.maxTickets <= 0) return 'Maximum tickets must be greater than 0';
    if (formData.maxCapacity <= 0) return 'Maximum capacity per user must be greater than 0';
    if (formData.maxCapacity > formData.maxTickets) return 'Maximum capacity per user cannot exceed total tickets';
    
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    const now = new Date();

    if (startDateTime <= now) return 'Event start time must be in the future';
    if (endDateTime <= startDateTime) return 'End time must be after start time';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tribeId) {
      alert('Tribe ID is required');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Create metadata
      const metadata: EventMetadata = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: `${formData.date}T${formData.startTime}`,
        location: formData.location.trim(),
        image: imageUrl || '',
        category: formData.category,
        maxCapacity: formData.maxCapacity,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`
      };

      // Create new event
      const eventId = await eventTicketsService.createEvent(
        parseInt(tribeId),
        metadata,
        formData.maxTickets,
        formData.price,
        formData.isPrivate
      );

      console.log('Event created successfully with ID:', eventId);
      alert('Event created successfully!');
      navigate(`/community/${tribeId}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tribeDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lightBg to-lightBgSecondary dark:from-darkBg dark:to-darkBgSecondary">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#BBF10A]" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading tribe details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lightBg to-lightBgSecondary dark:from-darkBg dark:to-darkBgSecondary">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/community/${tribeId}`)}
            className="mb-6 group transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {tribeDetails.name}
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-3">
              Create New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Host an amazing event for your community
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-lightCard dark:bg-darkCard rounded-2xl shadow-xl border border-lightCardBorder dark:border-darkCardBorder p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Basic Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Event Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event in detail..."
                  rows={4}
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Date & Time
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Location
                </h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  Event Location *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Ticket Configuration */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Ticket Configuration
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Maximum Tickets *
                  </label>
                  <Input
                    type="number"
                    value={formData.maxTickets}
                    onChange={(e) => handleInputChange('maxTickets', parseInt(e.target.value))}
                    min="1"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Price (XDC)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0 for free"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Max Capacity Per User
                  </label>
                  <Input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value))}
                    min="1"
                    max={formData.maxTickets}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Private Event Toggle - Only show if price is 0 */}
              {formData.price === '0' && (
                <div className="bg-lightCardSecondary dark:bg-darkCardSecondary rounded-xl p-6 border border-lightCardBorder dark:border-darkCardBorder">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.isPrivate}
                        onChange={(checked) => handleInputChange('isPrivate', checked)}
                      />
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          Private Event
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Requires approval for ticket requests
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Lock className="w-4 h-4" />
                      <span>Approval Required</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.price !== '0' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Paid events are always public</span>
                  </div>
                </div>
              )}
            </div>

            {/* Event Image */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Event Image
                </h2>
              </div>
              
              <div className="space-y-4">
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
                  <div className="relative w-64 h-40 rounded-xl overflow-hidden border border-lightCardBorder dark:border-darkCardBorder shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                        setImageUrl('');
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-lightCardBorder dark:border-darkCardBorder">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/community/${tribeId}`)}
                disabled={isLoading}
                className="px-8"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || imageUploading}
                className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-accentBlue/90 px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}