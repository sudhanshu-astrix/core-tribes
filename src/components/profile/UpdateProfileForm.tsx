import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Avatar } from '../ui/Avatar';
import { Toast } from '../ui/Toast';
import { uploadFiles, updateProfile } from '../../services/BackendService';
import { profileContractService, UpdateProfileResult } from '../../services/ProfileContract';
import { useWalletStore } from '../../store/walletStore';
import { 
  User, 
  AtSign, 
  FileText, 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  Camera, 
  Image as ImageIcon,
  Save,
  Loader2,
  X,
  Instagram,
  Youtube
} from 'lucide-react';

interface ProfileFormData {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  socialLinks: {
    github: string;
    twitter: string;
    linkedin: string;
    website: string;
    instagram: string;
    youtube: string;
  };
}

interface UpdateProfileFormProps {
  user: any;
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
}

export function UpdateProfileForm({ user, onClose, onUpdate }: UpdateProfileFormProps) {
  const { address } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    displayName: user?.displayName || user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    banner: user?.bannerImage || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      twitter: user?.socialLinks?.twitter || '',
      linkedin: user?.socialLinks?.linkedin || '',
      website: user?.socialLinks?.website || '',
      instagram: user?.socialLinks?.instagram || '',
      youtube: user?.socialLinks?.youtube || '',
    },
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Calculate form completion percentage
  const formCompletion = () => {
    const requiredFields = [
      formData.username,
      formData.displayName,
    ];
    const completedRequiredFields = requiredFields.filter(field => field.trim() !== '').length;
    return Math.round((completedRequiredFields / requiredFields.length) * 100);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLinkChange = (platform: keyof ProfileFormData['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleImageUpload = async (type: 'avatar' | 'banner', file: File) => {
    console.log(`Uploading ${type} image:`, file.name, file.size, file.type);
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`File size too large. Please select an image smaller than 5MB.`);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    
    setIsUploadingImage(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file using uploadFiles API
      const response = await uploadFiles(formData, 'tribes', 'tribes');
      
      if (response && response.status) {
        console.log(`${type} image uploaded successfully:`, response.content);
        setFormData(prev => ({ ...prev, [type]: response?.content?.uploadedUrl }));
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      alert(`Error uploading ${type} image. Please try again.`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    console.log({formData});
  },[formData])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

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

    setIsSubmitting(true);
    
    try {
      // Step 1: Initialize Profile Contract Service
      await profileContractService.initialize();
      console.log('Profile contract initialized');

      // Step 2: Get user's NFT token ID
      const tokenId = await profileContractService.getTokenIdByUsername(formData.username);
      console.log('User NFT token ID:', tokenId);

      // Step 3: Prepare profile metadata for blockchain
      const profileMetadata = {
        username: formData.username,
        displayName: formData.displayName,
        bio: formData.bio,
        avatar: formData.avatar,
        banner: formData.banner,
        socialLinks: formData.socialLinks,
        updatedAt: new Date().toISOString()
      };

      // Step 4: Stringify metadata and create metadata URI
      const metadataString = JSON.stringify(profileMetadata);
      const metadataURI = `data:application/json;base64,${btoa(metadataString)}`;

      // Step 5: Update profile metadata on blockchain
      const contractParams = {
        tokenId: tokenId,
        newMetadataURI: metadataURI
      };

      console.log('Updating profile metadata on blockchain with params:', contractParams);
      const contractResult: UpdateProfileResult = await profileContractService.updateProfileMetadata(contractParams);
      console.log('Profile metadata updated on blockchain:', contractResult);

      // Step 6: Prepare social links in the required format
      const socialLinksArray = Object.entries(formData.socialLinks)
        .filter(([_, url]) => url.trim() !== '')
        .map(([platform, url]) => ({
          platform,
          url: url.trim()
        }));

      // Step 7: Prepare profile data for API call
      const profileData = {
        username: formData.username,
        displayName: formData.displayName,
        address: address || '',
        bio: formData.bio,
        avatarUrl: formData.avatar,
        bannerUrl: formData.banner,
        socialLinks: socialLinksArray,
        nftTokenId: tokenId,
        profileHash: contractResult.transactionHash
      };

      console.log('Calling update profile API with data:', profileData);

      // Step 8: Call the updateProfile API
      const response: any = await updateProfile(profileData, user?.id);
      console.log('Update profile API response:', response);
      
      if (response && response.success) {
        // Update user store with the user data from response
        if (response?.data?.user) {
          onUpdate(response.user);
          console.log('User data updated from API response:', response.data?.user);
        } else {
          // Fallback: Update user store with form data if no user in response
          const updatedUser = {
            ...user,
            username: formData.username,
            displayName: formData.displayName,
            bio: formData.bio,
            avatar: formData.avatar,
            bannerImage: formData.banner,
            socialLinks: [formData.socialLinks as { [key: string]: string }] as [{ [key: string]: string }],
          };
          onUpdate(updatedUser);
        }
        
        // Show success message
        setShowSuccessToast(true);
        
        // Close form after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-lightCard dark:bg-darkCard rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Update Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Update your profile information
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Banner and Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Profile Images <span className="text-gray-500 dark:text-gray-400 font-normal text-base">(Optional)</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your profile picture and banner
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  Banner Image <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  {formData?.banner ? (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={formData?.banner}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Banner image failed to load:', e);
                          setFormData(prev => ({ ...prev, banner: '' }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#BBF10A] dark:hover:border-[#BBF10A] transition-colors"
                    >
                                        <div className="text-center">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Uploading banner image...
                        </p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to upload banner image
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Recommended: 1200x400 pixels
                        </p>
                      </>
                    )}
                  </div>
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleImageUpload('banner', file);
                    }}
                  />
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-3">
                    Profile Picture
                  </label>
                  <div className="relative">
                    <Avatar
                      src={formData.avatar || user.avatar}
                      alt="Profile"
                      size="xl"
                      objectFit="contain"
                      className="w-24 h-24 cursor-pointer bg-gray-100 dark:bg-gray-800"
                      onClick={() => fileInputRef.current?.click()}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-[#BBF10A] text-white p-1.5 rounded-full hover:bg-[#BBF10A]/90 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleImageUpload('avatar', file);
                    }}
                  />
                </div>
                <div className="flex-1">
                  {isUploadingImage ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uploading profile picture...
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload a profile picture to personalize your account. 
                      Recommended size: 400x400 pixels. <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Username <span className="text-gray-500 dark:text-gray-400 font-normal">(Cannot be changed)</span>
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.username}
                      disabled
                      className="pl-10 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Username cannot be changed once set
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
                Add your social media profiles and website
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          type="success"
          title="Profile Updated!"
          description="Your profile has been successfully updated."
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
} 