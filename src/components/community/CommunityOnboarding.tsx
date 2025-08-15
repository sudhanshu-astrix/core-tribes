import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { ImageUpload } from '../ui/ImageUpload';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

interface CommunityOnboardingProps {
  community: {
    id: string;
    name: string;
    logo: string;
    description: string;
  };
  onComplete: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add a profile picture and tell us about yourself',
    isCompleted: false
  },
  {
    id: 'interests',
    title: 'Select Your Interests',
    description: 'Choose topics you\'re interested in',
    isCompleted: false
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Set up how you want to be notified',
    isCompleted: false
  },
  {
    id: 'guidelines',
    title: 'Community Guidelines',
    description: 'Review and accept community guidelines',
    isCompleted: false
  }
];

const INTERESTS = [
  'Technology',
  'Art',
  'Gaming',
  'Finance',
  'Music',
  'Sports',
  'Education',
  'Other'
];

export function CommunityOnboarding({ community, onComplete }: CommunityOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(ONBOARDING_STEPS);
  const [profileData, setProfileData] = useState({
    avatar: null as File | null,
    bio: '',
    interests: [] as string[],
    notifications: {
      posts: true,
      events: true,
      mentions: true,
      updates: true
    },
    acceptedGuidelines: false
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar
                src={profileData.avatar ? URL.createObjectURL(profileData.avatar) : undefined}
                alt="Profile"
                size="xl"
              />
              <ImageUpload
                onImageSelect={(file) => {
                  setProfileData(prev => ({ ...prev, avatar: file }));
                  handleStepComplete('profile');
                }}
                aspectRatio={1}
                className="w-32 h-32"
              />
            </div>
            <Textarea
              label="Bio"
              value={profileData.bio}
              onChange={(e) => {
                setProfileData(prev => ({ ...prev, bio: e.target.value }));
                if (e.target.value) handleStepComplete('profile');
              }}
              placeholder="Tell us about yourself"
            />
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  onClick={() => {
                    const newInterests = profileData.interests.includes(interest)
                      ? profileData.interests.filter(i => i !== interest)
                      : [...profileData.interests, interest];
                    setProfileData(prev => ({ ...prev, interests: newInterests }));
                    if (newInterests.length > 0) handleStepComplete('interests');
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    profileData.interests.includes(interest)
                      ? 'bg-[#BBF10A] text-black'
                      : 'bg-lightCard dark:bg-darkCard text-black dark:text-white hover:bg-lightCard/80 dark:hover:bg-darkCard/80'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            {Object.entries(profileData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{key}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications for {key}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => {
                    setProfileData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [key]: e.target.checked
                      }
                    }));
                    handleStepComplete('notifications');
                  }}
                  className="rounded border-gray-300"
                />
              </div>
            ))}
          </div>
        );

      case 'guidelines':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p>Welcome to {community.name}! Please review and follow these guidelines:</p>
                  <ul>
                    <li>Be respectful and kind to other members</li>
                    <li>No spam or self-promotion</li>
                    <li>Keep discussions relevant to the community</li>
                    <li>Report any inappropriate behavior</li>
                    <li>Follow the community's specific rules</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="acceptGuidelines"
                checked={profileData.acceptedGuidelines}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, acceptedGuidelines: e.target.checked }));
                  if (e.target.checked) handleStepComplete('guidelines');
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor="acceptGuidelines" className="text-sm">
                I have read and agree to follow the community guidelines
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index === currentStep
                  ? 'bg-[#BBF10A] text-black'
                  : step.isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-lightCard dark:bg-darkCard text-gray-600 dark:text-gray-400'
              }`}
            >
              {step.isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-1 ${
                  step.isCompleted
                    ? 'bg-green-500'
                    : 'bg-lightCard dark:bg-darkCard'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!steps[currentStep].isCompleted}
          className="flex items-center gap-2"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 