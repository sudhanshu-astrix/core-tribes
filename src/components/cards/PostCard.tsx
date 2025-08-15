import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { postMinterService, Post, InteractionType } from '../../services/PostMinterService';
import { useWalletStore } from '../../store/walletStore';
import { Toast } from '../ui/Toast';
import { 
  Heart, 
  MoreHorizontal, 
  Trash2,
  Edit,
  Loader2,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (postId: number) => void;
  onPostDeleted?: (postId: number) => void;
  showTribeName?: boolean;
  tribeName?: string;
}

export function PostCard({ 
  post, 
  onPostUpdated, 
  onPostDeleted, 
  showTribeName = false,
  tribeName 
}: PostCardProps) {
  const { address } = useWalletStore();
  const [likeCount, setLikeCount] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Map warning to info since Toast component doesn't support warning
    const toastType = type === 'warning' ? 'info' : type;
    setToast({ show: true, message, type: toastType });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const isOwner = address?.toLowerCase() === post.creator.toLowerCase();

  useEffect(() => {
    loadPostStats();
    checkUserLikeStatus();
  }, [post.id, address]);

  const loadPostStats = async () => {
    try {
      await postMinterService.initialize();
      const likes = await postMinterService.getInteractionCount(post.id, InteractionType.LIKE);
      setLikeCount(Number(likes));
    } catch (error) {
      console.error('Failed to load post stats:', error);
      showToast('Failed to load post statistics', 'error');
    }
  };

  const checkUserLikeStatus = async () => {
    if (!address) {
      setUserLiked(false);
      return;
    }

    try {
      // Check if user has already liked this post using localStorage
      const userLikesKey = `user_likes_${address.toLowerCase()}`;
      const userLikes = JSON.parse(localStorage.getItem(userLikesKey) || '[]');
      const hasLiked = userLikes.includes(post.id);
      setUserLiked(hasLiked);
    } catch (error) {
      console.error('Failed to check user like status:', error);
      setUserLiked(false);
      showToast('Failed to load like status', 'warning');
    }
  };

  const updateUserLikeStatus = (postId: number, liked: boolean) => {
    if (!address) return;

    try {
      const userLikesKey = `user_likes_${address.toLowerCase()}`;
      const userLikes = JSON.parse(localStorage.getItem(userLikesKey) || '[]');
      
      if (liked) {
        if (!userLikes.includes(postId)) {
          userLikes.push(postId);
        }
      } else {
        const index = userLikes.indexOf(postId);
        if (index > -1) {
          userLikes.splice(index, 1);
        }
      }
      
      localStorage.setItem(userLikesKey, JSON.stringify(userLikes));
    } catch (error) {
      console.error('Failed to update user like status:', error);
      showToast('Failed to save like status', 'warning');
    }
  };

  const handleLike = async () => {
    if (!address) {
      showToast('Please connect your wallet to like posts', 'warning');
      return;
    }

    setIsInteracting(true);
    try {
      await postMinterService.initialize();
      await postMinterService.interactWithPost(post.id, InteractionType.LIKE);
      
      // Update local state
      const newLikedStatus = !userLiked;
      setUserLiked(newLikedStatus);
      setLikeCount(prev => prev + (userLiked ? -1 : 1));
      updateUserLikeStatus(post.id, newLikedStatus);
      
      showToast(newLikedStatus ? 'Post liked successfully!' : 'Post unliked', 'success');
    } catch (error: any) {
      console.error('Failed to like post:', error);
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to like post. Please try again.';
      
      if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.message) {
        // Check for common error patterns
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection';
        } else if (error.message.includes('revert')) {
          errorMessage = 'Transaction failed. Please try again';
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsInteracting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postMinterService.initialize();
      await postMinterService.deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      showToast('Post deleted successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to delete post. Please try again.';
      
      if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.message) {
        // Check for common error patterns
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection';
        } else if (error.message.includes('revert')) {
          errorMessage = 'Transaction failed. Please try again';
        }
      }
      
      showToast(errorMessage, 'error');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creator}`}
                alt={formatAddress(post.creator)}
                size="md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">
                    {formatAddress(post.creator)}
                  </span>
                  {isOwner && (
                    <span className="text-xs bg-accentBlue text-white px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  {showTribeName && tribeName && (
                    <>
                      <span>•</span>
                      <span>{tribeName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                
                {showOptions && (
                  <div className="absolute right-0 top-full mt-1 bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        // TODO: Implement edit functionality
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-lightCardHover dark:hover:bg-darkCardHover flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        handleDeletePost();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-lightCardHover dark:hover:bg-darkCardHover text-red-500 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post Title */}
          {post.metadata.title && post.metadata.title !== 'Untitled Post' && (
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {post.metadata.title}
            </h3>
          )}

          {/* Post Content */}
          {post.metadata.content && (
            <p className="text-black dark:text-white whitespace-pre-wrap">
              {post.metadata.content}
            </p>
          )}

          {/* Post Image */}
          {post.metadata.image && (
            <div className="space-y-2">
              <img
                src={post.metadata.image}
                alt="Post"
                className="w-full rounded-lg max-h-96 object-cover"
              />
              {post.metadata.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {post.metadata.caption}
                </p>
              )}
            </div>
          )}

          {/* Interaction Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {/* Stats can be added here in the future if needed */}
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-lightCard/30 dark:border-darkCard/30">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isInteracting}
                className={`flex items-center gap-2 transition-colors ${
                  userLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-gray-600'
                }`}
              >
                {userLiked ? (
                  <Heart className="h-4 w-4 fill-current" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Like</span>
                <span className="text-sm font-medium">({likeCount})</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}