import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { Toast } from '../ui/Toast';
import { uploadFiles } from '../../services/BackendService';
import { tribeContractService, JoinType, NFTType } from '../../services/TribeContract';
import { useTribeStore } from '../../store/store';
import { useWalletStore } from '../../store/walletStore';
import { 
  Users, 
  FileText, 
  Image as ImageIcon,
  Camera,
  Save,
  Loader2,
  X,
  Globe,
  Hash,
  Plus,
  Trash2
} from 'lucide-react';

interface CommunityFormData {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  logo: string;
  banner: string;
  guidelines: string;
  tags: string[];
  joinType: number;
  entryFee: number;
}

export function CommunityCreateForm() {
  const navigate = useNavigate();
  const { addCommunity } = useTribeStore();
  const { address } = useWalletStore();
  
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    logo: '',
    banner: '',
    guidelines: '',
    tags: [],
    joinType: JoinType.Public,
    entryFee: 0
  });

  const [errors, setErrors] = useState<Partial<CommunityFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const formCompletion = () => {
    const fields = ['name', 'description', 'category'];
    const completed = fields.filter(field => 
      formData[field as keyof CommunityFormData] && 
      String(formData[field as keyof CommunityFormData]).trim() !== ''
    ).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleInputChange = (field: keyof CommunityFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
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
      const response = await uploadFiles(formData, 'tribes', 'communities');
      
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

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleDebugContract = async () => {
    try {
      await tribeContractService.initialize();
      const debugResult = await tribeContractService.debugContract();
      setDebugInfo(JSON.stringify(debugResult, null, 2));
    } catch (error) {
      setDebugInfo(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestMinimalTribe = async () => {
    try {
      await tribeContractService.initialize();
      const testResult = await tribeContractService.testCreateMinimalTribe();
      setDebugInfo(JSON.stringify(testResult, null, 2));
    } catch (error) {
      setDebugInfo(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVerifyContract = async () => {
    try {
      await tribeContractService.initialize();
      const verification = await tribeContractService.verifyContract();
      const basicTest = await tribeContractService.testBasicContractFunctions();
      const abiCheck = await tribeContractService.checkABIMatch();
      setDebugInfo(JSON.stringify({ verification, basicTest, abiCheck }, null, 2));
    } catch (error) {
      setDebugInfo(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CommunityFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.guidelines.length > 1000) {
      newErrors.guidelines = 'Guidelines must be less than 1000 characters';
    }

    if (formData.entryFee < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative';
    }

    if (formData.entryFee > 100) {
      newErrors.entryFee = 'Entry fee cannot exceed 100 ETH';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!address) {
      alert('Please connect your wallet to create a community');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Step 1: Initialize Tribe Contract Service
      await tribeContractService.initialize();
      console.log('Tribe contract initialized');

      // Step 2: Prepare metadata for blockchain
      const metadata = JSON.stringify({
        description: formData.description,
        category: formData.category,
        guidelines: formData.guidelines,
        tags: formData.tags,
        logo: formData.logo || 'https://via.placeholder.com/150x150?text=Community',
        banner: formData.banner,
        isPrivate: formData.isPrivate
      });

      // Check metadata length (some contracts have limits)
      if (metadata.length > 10000) {
        throw new Error('Metadata is too long. Please reduce the description or guidelines length.');
      }

      // Step 3: Prepare contract parameters
      const entryFeeInWei = Math.floor(formData.entryFee * 10**18); // Convert to wei and ensure it's an integer
      
      const contractParams = {
        name: formData.name.trim(),
        metadata: metadata,
        admins: [address], // Creator is the first admin
        joinType: formData.joinType,
        entryFee: 0,
        nftRequirements: [] // Empty for now, can be extended later
      };

      console.log('Creating tribe on blockchain with params:', contractParams);
      console.log('Entry fee in ETH:', formData.entryFee);
      console.log('Entry fee in Wei:', entryFeeInWei);
      console.log('Metadata length:', metadata.length);
      console.log('Metadata preview:', metadata.substring(0, 200) + '...');
    
      
      // Step 4: Create tribe on blockchain
      const contractResult = await tribeContractService.createTribe(contractParams);
      console.log('Tribe created on blockchain:', contractResult);

      // Step 5: Create new community object for local store
      const newCommunity = {
        id: contractResult.tribeId.toString(),
        name: formData.name,
        description: formData.description,
        logo: formData.logo || 'https://via.placeholder.com/150x150?text=Community',
        bannerImage: formData.banner,
        memberCount: 1, // Creator is the first member
        isPrivate: formData.isPrivate,
        creatorId: address,
        createdAt: new Date().toISOString(),
        rules: formData.guidelines ? [formData.guidelines] : [],
        pointsConfig: {
          postCreation: 10,
          reactionGiven: 2,
          eventParticipation: 20,
          proposalVote: 5,
          commentOrReply: 3
        },
        tribeId: contractResult.tribeId,
        tribeHash: contractResult.transactionHash
      };

      // Step 6: Add to store
      addCommunity(newCommunity);
      
      // Step 7: Show success message
      setShowSuccessToast(true);
      
      // Step 8: Navigate back after a short delay
      setTimeout(() => {
        navigate('/communities');
      }, 1500);
    } catch (error) {
      console.error('Error creating tribe:', error);
      
      let errorMessage = 'Failed to create tribe. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Parameter validation failed:')) {
          errorMessage = error.message;
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Contract execution failed. This might be due to:\n1. Invalid parameters\n2. Contract is paused\n3. Insufficient permissions\n4. Network issues\n\nPlease check your input and try again.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to pay for transaction gas.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
            Form Completion
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDebugContract}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Debug Contract
            </button>
            <button
              type="button"
              onClick={handleTestMinimalTribe}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Minimal Tribe
            </button>
            <button
              type="button"
              onClick={handleVerifyContract}
              className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Verify Contract
            </button>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {formCompletion()}%
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${formCompletion()}%` }}
          ></div>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Community Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Community Images <span className="text-gray-500 dark:text-gray-400 font-normal text-sm sm:text-base">(Optional)</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Add a logo and banner for your community
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-3">
                Banner Image <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                {formData.banner ? (
                  <div className="relative h-32 sm:h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={formData.banner}
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
                      <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="h-32 sm:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="text-center px-4">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Uploading banner image...
                          </p>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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

            {/* Logo */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  Community Logo
                </label>
                <div className="relative">
                  <Avatar
                    src={formData.logo}
                    alt="Community"
                    size="xl"
                    objectFit="contain"
                    className="w-20 h-20 sm:w-24 sm:h-24 cursor-pointer bg-gray-100 dark:bg-gray-800"
                    onClick={() => logoInputRef.current?.click()}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 sm:p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleImageUpload('logo', file);
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Upload a logo for your community. This will be displayed in community listings and member profiles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Basic Information
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Set up the basic details for your community
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Community Name *
              </label>
              <Input
                type="text"
                placeholder="Enter community name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Description *
              </label>
              <Textarea
                placeholder="Describe your community..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                maxLength={500}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.description.length}/500 characters
                </span>
                {errors.description && (
                  <span className="text-xs text-red-500">{errors.description}</span>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  { value: '', label: 'Select a category' },
                  { value: 'technology', label: 'Technology' },
                  { value: 'art', label: 'Art & Culture' },
                  { value: 'gaming', label: 'Gaming' },
                  { value: 'finance', label: 'Finance & Crypto' },
                  { value: 'education', label: 'Education' },
                  { value: 'health', label: 'Health & Wellness' },
                  { value: 'sports', label: 'Sports' },
                  { value: 'music', label: 'Music' },
                  { value: 'business', label: 'Business' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Join Type */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Join Type
              </label>
              <Select
                value={formData.joinType.toString()}
                onChange={(e) => handleInputChange('joinType', parseInt(e.target.value))}
                options={[
                  { value: JoinType.Public.toString(), label: 'Public - Anyone can join' },
                  { value: JoinType.InviteOnly.toString(), label: 'Invite Only - Requires invite code' },
                  { value: JoinType.Whitelist.toString(), label: 'Whitelist - Admin approval required' },
                  { value: JoinType.NFTGated.toString(), label: 'NFT Gated - Requires specific NFTs' }
                ]}
              />
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-black dark:text-white">
                  Private Community
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Only approved members can see content
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
              Community Guidelines
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Set rules and guidelines for your community
            </p>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Guidelines (Optional)
              </label>
              <Textarea
                placeholder="Set community rules and guidelines..."
                value={formData.guidelines}
                onChange={(e) => handleInputChange('guidelines', e.target.value)}
                rows={4}
                maxLength={1000}
                className={errors.guidelines ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.guidelines.length}/1000 characters
                </span>
                {errors.guidelines && (
                  <span className="text-xs text-red-500">{errors.guidelines}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
              Tags
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Add tags to help people discover your community
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleTagAdd}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/communities')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
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
                Create Community
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          type="success"
          title="Community Created!"
          description="Your community has been created successfully."
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
} 