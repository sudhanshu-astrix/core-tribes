import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ImageUpload } from '../ui/ImageUpload';
import { postMinterService, PostMetadata } from '../../services/PostMinterService';
import { uploadFiles } from '../../services/BackendService';
import { useWalletStore } from '../../store/walletStore';
import { Loader2, Image, X, Send } from 'lucide-react';

interface PostCreateFormProps {
  tribeId: number;
  onPostCreated?: (postId: number) => void;
  onCancel?: () => void;
}

export function PostCreateForm({ tribeId, onPostCreated, onCancel }: PostCreateFormProps) {
  const { address } = useWalletStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    caption: '',
    image: null as File | null,
    imageUrl: '',
    imagePreview: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      image: file,
      imagePreview: URL.createObjectURL(file)
    }));

    // Upload image immediately
    setImageUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const response = await uploadFiles(uploadData, 'tribes', 'tribes');
      if (response && response.status) {
        const uploadedUrl = response.content.uploadedUrl;
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: uploadedUrl,
          imagePreview: uploadedUrl
        }));
      } else {
        throw new Error(response?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: null,
      imageUrl: '',
      imagePreview: ''
    }));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Either content or image must be provided
    if (!formData.content.trim() && !formData.imageUrl) {
      newErrors.content = 'Please provide either content or an image';
    }

    // Title is optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!address) {
      setErrors(prev => ({ ...prev, general: 'Please connect your wallet to create a post' }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Initialize the service
      await postMinterService.initialize();

      // Determine post type based on content
      const postType = formData.imageUrl ? 'RICH_MEDIA' : 'TEXT';
      
      const metadata: PostMetadata = {
        title: formData.title.trim() || 'Untitled Post',
        content: formData.content.trim(),
        caption: formData.caption.trim(),
        image: formData.imageUrl,
        type: postType,
        createdAt: new Date().toISOString(),
        tags: [],
        category: 'general'
      };

      // Validate metadata before creating post
      const metadataString = JSON.stringify(metadata);
      const postTypeEnum = formData.imageUrl ? 1 : 0; // RICH_MEDIA = 1, TEXT = 0
      
      console.log('Creating post with metadata:', metadataString);
      console.log('Post type enum:', postTypeEnum);
      
      const isValid = await postMinterService.validateMetadata(metadataString, postTypeEnum);
      
      if (!isValid) {
        throw new Error('Invalid metadata format. Please check your post content.');
      }

      const postId = await postMinterService.createPost(tribeId, metadata);
      
      console.log('Post created successfully:', postId);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        caption: '',
        image: null,
        imageUrl: '',
        imagePreview: ''
      });
      
      // Call callback
      if (onPostCreated) {
        onPostCreated(postId);
      }
      
    } catch (error) {
      console.error('Failed to create post:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to create post. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Create Post
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your thoughts, images, or updates with your tribe
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <Input
              placeholder="Post title (optional)"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Content Input */}
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-black dark:text-white">
                Add Image (Optional)
              </span>
            </div>
            
            {!formData.imagePreview ? (
              <div className="border-2 border-dashed border-lightCard/50 dark:border-darkCard/50 rounded-lg p-6 text-center hover:border-[#BBF10A]/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting || imageUploading}
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Image className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {imageUploading ? 'Uploading...' : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
                {imageUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            )}
            
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Caption Input (only show if image is uploaded) */}
          {formData.imageUrl && (
            <div>
              <Input
                placeholder="Add a caption to your image..."
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || imageUploading || (!formData.content.trim() && !formData.imageUrl)}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 