import React, { useState, useEffect } from 'react';
import { useProfileContract } from '@/hooks/useProfileContract';
import { useWalletStore } from '@/store/walletStore';
import { ProfileData } from '@/services/ProfileContract';
import { createProfileWorkflow, updateProfileWorkflow, fetchMetadata, formatProfileData } from '@/utils/profileUtils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';

export const ProfileContractExample: React.FC = () => {
  const { isConnected, address } = useWalletStore();
  const {
    isInitialized,
    isInitializing,
    error,
    createProfile,
    updateProfileMetadata,
    getUserProfile,
    hasProfile,
    usernameExists,
    clearError,
  } = useProfileContract();

  const [isLoading, setIsLoading] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    displayName: '',
    bio: '',
    avatar: '',
    bannerImage: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      website: '',
      instagram: '',
      youtube: '',
    },
  });

  // Check if user has profile on mount
  useEffect(() => {
    if (isInitialized && address) {
      checkUserProfile();
    }
  }, [isInitialized, address]);

  const checkUserProfile = async () => {
    if (!address) return;
    
    try {
      const hasProfileResult = await hasProfile(address);
      setUserHasProfile(hasProfileResult);
      
      if (hasProfileResult) {
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Failed to check user profile:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!address) return;
    
    try {
      const profileMetadata = await getUserProfile(address);
      if (profileMetadata) {
        const metadata = await fetchMetadata(profileMetadata.metadataURI);
        const profileData = formatProfileData(metadata);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleCreateProfile = async () => {
    if (!address) return;
    
    setIsLoading(true);
    clearError();
    
    try {
      // Create metadata and upload to IPFS
      const { metadataURI } = await createProfileWorkflow(formData);
      
      // Create profile on blockchain
      const tokenId = await createProfile({
        username: formData.username,
        metadataURI,
      });
      
      console.log('Profile created successfully with token ID:', tokenId);
      
      // Refresh user profile
      await checkUserProfile();
      setShowCreateForm(false);
      
      // Show success message
      Toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Failed to create profile:', error);
      Toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!address || !userProfile) return;
    
    setIsLoading(true);
    clearError();
    
    try {
      // Get user's token ID (simplified - you might need to track this)
      const tokenId = 0; // This should be the actual token ID
      
      // Create updated metadata and upload to IPFS
      const { metadataURI } = await updateProfileWorkflow(tokenId, formData);
      
      // Update profile on blockchain
      await updateProfileMetadata({
        tokenId,
        newMetadataURI: metadataURI,
      });
      
      console.log('Profile updated successfully');
      
      // Refresh user profile
      await loadUserProfile();
      setShowUpdateForm(false);
      
      // Show success message
      Toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameCheck = async (username: string) => {
    if (!username) return;
    
    try {
      const exists = await usernameExists(username);
      if (exists) {
        Toast.error('Username already exists');
      } else {
        Toast.success('Username is available');
      }
    } catch (error) {
      console.error('Failed to check username:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Contract</h2>
        <p className="text-gray-600">Please connect your wallet to use profile features.</p>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Contract</h2>
        <p className="text-gray-600">Initializing contract connection...</p>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Contract</h2>
        <p className="text-gray-600">Contract not initialized. Please try again.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Contract Status</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Clear
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <p><strong>Wallet Address:</strong> {address}</p>
          <p><strong>Has Profile:</strong> {userHasProfile ? 'Yes' : 'No'}</p>
          <p><strong>Contract Status:</strong> {isInitialized ? 'Connected' : 'Disconnected'}</p>
        </div>
      </Card>

      {userHasProfile && userProfile && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Profile</h3>
          <div className="space-y-2">
            <p><strong>Username:</strong> @{userProfile.username}</p>
            <p><strong>Display Name:</strong> {userProfile.displayName}</p>
            <p><strong>Bio:</strong> {userProfile.bio || 'No bio'}</p>
            <p><strong>Avatar:</strong> {userProfile.avatar || 'No avatar'}</p>
          </div>
          <Button
            onClick={() => {
              setFormData(userProfile);
              setShowUpdateForm(true);
            }}
            className="mt-4"
          >
            Update Profile
          </Button>
        </Card>
      )}

      {!userHasProfile && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Profile</h3>
          <p className="text-gray-600 mb-4">You don't have a profile yet. Create one to get started.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Profile
          </Button>
        </Card>
      )}

      {(showCreateForm || showUpdateForm) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {showCreateForm ? 'Create Profile' : 'Update Profile'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <div className="flex gap-2">
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  disabled={showUpdateForm} // Username cannot be changed
                />
                <Button
                  variant="outline"
                  onClick={() => handleUsernameCheck(formData.username)}
                  disabled={!formData.username}
                >
                  Check
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <Input
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter your bio"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Avatar URL</label>
              <Input
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                placeholder="Enter avatar URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <Input
                value={formData.bannerImage}
                onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                placeholder="Enter banner image URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Social Links</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.socialLinks).map(([platform, url]) => (
                  <div key={platform}>
                    <label className="block text-xs font-medium mb-1 capitalize">{platform}</label>
                    <Input
                      value={url}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      placeholder={`${platform} URL`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={showCreateForm ? handleCreateProfile : handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (showCreateForm ? 'Create Profile' : 'Update Profile')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowUpdateForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 