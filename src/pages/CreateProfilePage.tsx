import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/store';
import { useWalletStore } from '../store/walletStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { Toast } from '../components/ui/Toast';
import { shortenAddress } from '../lib/utils';
import { createProfile } from '../services/BackendService';
import { profileContractService, CreateProfileResult } from '../services/ProfileContract';
import { setToken } from '../utlils/utliFunctions';
import { 
  User, 
  AtSign, 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  ArrowLeft,
  Save,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { Instagram, Youtube } from 'lucide-react';

interface ProfileFormData {
  username: string;
  displayName: string;
  bio: string;
  socialLinks: {
    github: string;
    twitter: string;
    linkedin: string;
    website: string;
    instagram: string;
    youtube: string;
  };
}

export function CreateProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  const { address, isConnected } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    displayName: '',
    bio: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      website: '',
      instagram: '',
      youtube: '',
    },
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      await profileContractService.initialize();
      const exists = await profileContractService.usernameExists(username);
      setUsernameAvailable(!exists);
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Calculate form completion percentage
  const formCompletion = () => {
    const requiredFields = [
      formData.username,
      formData.displayName,
    ];
    const completedRequiredFields = requiredFields.filter(field => field.trim() !== '').length;
    return Math.round((completedRequiredFields / requiredFields.length) * 100);
  };

  if (!isConnected || !user) {
    return (
      <div className="max-w-screen-xl h-[85vh] mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
          Connect your wallet first
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to connect a wallet to create your profile.
        </p>
        <Button onClick={() => navigate('/')}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Check username availability when username field changes
    if (field === 'username') {
      checkUsernameAvailability(value);
    }
  };

  const handleSocialLinkChange = (platform: keyof ProfileFormData['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };



  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (usernameAvailable === false) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Step 1: Initialize Profile Contract Service
      await profileContractService.initialize();
      console.log('Profile contract initialized');

      // Step 2: Create profile on blockchain first
      const metadataURI = "ipfs://QmYourMetadataHash"; // You might want to upload metadata to IPFS first
      const contractParams = {
        username: formData.username,
        metadataURI: metadataURI
      };

      console.log('Creating profile on blockchain with params:', contractParams);
      const contractResult: CreateProfileResult = await profileContractService.createProfile(contractParams);
      console.log('Profile created on blockchain:', contractResult);

      // Step 4: Prepare social links in the required format
      const socialLinksArray = Object.entries(formData.socialLinks)
        .filter(([_, url]) => url.trim() !== '')
        .map(([platform, url]) => ({
          platform,
          url: url.trim()
        }));

      // Step 5: Prepare profile data in the required format with blockchain data
      const profileData = {
        username: formData.username,
        displayName: formData.displayName,
        address: address || '',
        bio: formData.bio,
        avatarUrl: "https://img.freepik.com/free-photo/woman-beach-with-her-baby-enjoying-sunset_52683-144131.jpg?size=626&ext=jpg",
        bannerUrl: "https://img.freepik.com/free-photo/woman-beach-with-her-baby-enjoying-sunset_52683-144131.jpg?size=626&ext=jpg",
        socialLinks: socialLinksArray,
        isVerified: "true",
        nftTokenId: contractResult.tokenId,
        profileHash: contractResult.transactionHash
      };

      console.log('Calling API with profile data:', profileData);

      // Step 6: Call the createProfile API with blockchain data
      const response: any = await createProfile(profileData);
      console.log('Create profile API response:', response);
      
      if (response && response.success) {
        // Save the auth token from response
        if (response?.data?.user) {
          setToken('authToken', response?.data?.token);
          console.log('Auth token saved successfully');
        }
        
        // Update user store with the user data from response
        if (response?.data?.user) {
          updateUser(response?.data?.user[0]);
          console.log('User data updated from API response:', response.data?.user[0]);
        } else {
          // Fallback: Update user store with form data if no user in response
          const updatedUser = {
            ...user,
            username: formData.username,
            displayName: formData.displayName,
            bio: formData.bio,
            avatar: profileData.avatarUrl,
            bannerImage: profileData.bannerUrl,
            socialLinks: [formData.socialLinks as { [key: string]: string }] as [{ [key: string]: string }],
            walletAddress: address || undefined,
          };
          updateUser(updatedUser);
        }
        
        // Show success message
        setShowSuccessToast(true);
        
        // Navigate to profile page after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      // Show error message to user
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SocialLinkInput = ({ 
    platform, 
    icon: Icon, 
    placeholder, 
    value 
  }: { 
    platform: keyof ProfileFormData['socialLinks']; 
    icon: any; 
    placeholder: string; 
    value: string; 
  }) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
        className="pl-10"
      />
    </div>
  );

  return (
    <div className="max-w-4xl h-[85vh] overflow-scroll mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your profile to get started with Tribes
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-black dark:text-white">
            Profile Completion
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formCompletion()}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
                            className="bg-gradient-to-r from-[#BBF10A] to-[#BBF10A]/80 h-2 rounded-full transition-all duration-300"
            style={{ width: `${formCompletion()}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`pl-10 ${errors.username ? 'border-red-500' : ''} ${
                      usernameAvailable === true ? 'border-green-500' : 
                      usernameAvailable === false ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                )}
                {!errors.username && usernameAvailable === true && (
                  <p className="text-sm text-green-500 mt-1">Username is available!</p>
                )}
                {!errors.username && usernameAvailable === false && (
                  <p className="text-sm text-red-500 mt-1">Username is already taken</p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This will be your unique identifier
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Your display name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={errors.displayName ? 'border-red-500' : ''}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Bio <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </label>
              <Textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                maxLength={500}
                className={errors.bio ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>

            {/* Wallet Address (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Wallet Address
              </label>
              <Input
                type="text"
                value={shortenAddress(address || '')}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Links <span className="text-gray-500 dark:text-gray-400 font-normal text-base">(Optional)</span>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your social media profiles to help others discover you
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialLinkInput
                platform="github"
                icon={Github}
                placeholder="https://github.com/username"
                value={formData.socialLinks.github}
              />
              <SocialLinkInput
                platform="twitter"
                icon={Twitter}
                placeholder="https://twitter.com/username"
                value={formData.socialLinks.twitter}
              />
              <SocialLinkInput
                platform="linkedin"
                icon={Linkedin}
                placeholder="https://linkedin.com/in/username"
                value={formData.socialLinks.linkedin}
              />
              <SocialLinkInput
                platform="instagram"
                icon={Instagram}
                placeholder="https://instagram.com/username"
                value={formData.socialLinks.instagram}
              />
              <SocialLinkInput
                platform="youtube"
                icon={Youtube}
                placeholder="https://youtube.com/@username"
                value={formData.socialLinks.youtube}
              />
              <SocialLinkInput
                platform="website"
                icon={Globe}
                placeholder="https://yourwebsite.com"
                value={formData.socialLinks.website}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profile')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Profile
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message="Profile created successfully! Redirecting..."
          type="success"
        />
      )}
    </div>
  );
} 