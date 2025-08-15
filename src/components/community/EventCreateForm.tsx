import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, DollarSign, Lock, Globe, Loader2, X, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { Modal } from '../ui/Modal';
import { eventContractService } from '../../services/EventContract';
import { roleManagerService } from '../../services/RoleManager';
import { useWalletStore } from '../../store/walletStore';
import { BecomeOrganizer } from './BecomeOrganizer';

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  locationType: 'virtual' | 'physical';
  maxTickets: number;
  isPaid: boolean;
  price: number;
  isPrivate: boolean;
  metadata: string;
}

export function EventCreateForm() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { address } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [hasOrganizerRole, setHasOrganizerRole] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    locationType: 'virtual',
    maxTickets: 100,
    isPaid: false,
    price: 0,
    isPrivate: false,
    metadata: ''
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  // Check organizer role on component mount
  useEffect(() => {
    const checkOrganizerRole = async () => {
      if (!address) return;

      try {
        setIsCheckingRole(true);
        await roleManagerService.initialize();
        const isOrganizer = await roleManagerService.isOrganizer(address);
        setHasOrganizerRole(isOrganizer);
      } catch (error) {
        console.error('Failed to check organizer role:', error);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkOrganizerRole();
  }, [address]);

  // Initialize event contract service
  useEffect(() => {
    const initService = async () => {
      try {
        await eventContractService.initialize();
      } catch (error) {
        console.error('Failed to initialize event contract service:', error);
      }
    };
    initService();
  }, []);

  // Handle role granted callback
  const handleRoleGranted = () => {
    setHasOrganizerRole(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.maxTickets <= 0) {
      newErrors.maxTickets = 'Maximum tickets must be greater than 0';
    }

    if (formData.isPaid && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0 for paid events';
    }

    // Validate date/time logic
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    if (startDateTime <= now) {
      newErrors.startDate = 'Event must start in the future';
    }

    if (endDateTime <= startDateTime) {
      newErrors.endDate = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet to create an event');
      return;
    }

    if (!hasOrganizerRole) {
      alert('You need to be an organizer to create events');
      return;
    }

    if (!communityId) {
      alert('Community ID is required');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);

      // Create metadata object
      const metadata = {
        title: formData.title,
        description: formData.description,
        startDateTime: `${formData.startDate}T${formData.startTime}`,
        endDateTime: `${formData.endDate}T${formData.endTime}`,
        location: formData.location,
        locationType: formData.locationType,
        tribeId: parseInt(communityId),
        createdBy: address,
        createdAt: new Date().toISOString()
      };

      // Convert metadata to JSON string
      const metadataURI = JSON.stringify(metadata);

      // Calculate price in wei (assuming XDC has 18 decimals like ETH)
      const priceInWei = formData.isPaid ? formData.price * Math.pow(10, 18) : 0;

      // Create event on blockchain
      const eventId = await eventContractService.createEvent(
        metadataURI,
        formData.maxTickets,
        priceInWei,
        formData.isPrivate
      );

      alert(`Event created successfully! Event ID: ${eventId}`);
      setIsOpen(false);
      
      // Navigate back to community page
      navigate(`/community/${communityId}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Show loading state while checking role
  if (isCheckingRole) {
    return (
      <Button disabled className="opacity-50">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking Role...
      </Button>
    );
  }

  // Show become organizer button if user doesn't have the role
  if (!hasOrganizerRole) {
    return <BecomeOrganizer onRoleGranted={handleRoleGranted} />;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-[#2A2A2A]"
        className="group hover:bg-accentBlue/90 transition-all duration-200 hover:scale-105"
      >
        <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
        Create Event
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="bg-lightCard dark:bg-darkCard rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Create New Event
              </h2>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
                <Crown className="w-4 h-4" />
                <span>Organizer</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#BBF10A]" />
                Event Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Event Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#BBF10A]" />
                Date & Time
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={errors.endTime ? 'border-red-500' : ''}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#BBF10A]" />
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Location Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="virtual"
                        checked={formData.locationType === 'virtual'}
                        onChange={(e) => handleInputChange('locationType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Virtual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="physical"
                        checked={formData.locationType === 'physical'}
                        onChange={(e) => handleInputChange('locationType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Physical</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Location *
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={formData.locationType === 'virtual' ? 'Zoom link, Discord, etc.' : 'Physical address'}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#BBF10A]" />
                Ticket Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Maximum Tickets *
                  </label>
                  <Input
                    type="number"
                    value={formData.maxTickets}
                    onChange={(e) => handleInputChange('maxTickets', parseInt(e.target.value))}
                    min="1"
                    className={errors.maxTickets ? 'border-red-500' : ''}
                  />
                  {errors.maxTickets && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxTickets}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Ticket Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.isPaid}
                        onChange={() => handleInputChange('isPaid', false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Free</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.isPaid}
                        onChange={() => handleInputChange('isPaid', true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Paid</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.isPaid && (
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Price (XDC) *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.isPrivate ? (
                    <Lock className="w-5 h-5 text-[#BBF10A]" />
                  ) : (
                    <Globe className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">
                      Require Approval
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formData.isPrivate 
                        ? 'Users must request tickets and wait for approval'
                        : 'Users can claim tickets directly'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="group transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 12 }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
} 