import { ethers } from 'ethers';
import { networksConfig } from '../config/networks.config';
import PostMinterABI from '../abis/PostMinter.json';

// Enums matching the contract
export enum PostType {
  TEXT = 0,
  RICH_MEDIA = 1,
  EVENT = 2,
  POLL = 3,
  PROJECT_UPDATE = 4,
  COMMUNITY_UPDATE = 5,
  ENCRYPTED = 6
}

export enum InteractionType {
  LIKE = 0,
  REPLY = 1,
  REPORT = 2
}

export interface PostMetadata {
  title?: string;
  content: string;
  image?: string;
  caption?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
  type?: string;
}

export interface Post {
  id: number;
  creator: string;
  tribeId: number;
  metadata: PostMetadata;
  isGated: boolean;
  collectibleContract?: string;
  collectibleId?: number;
  isEncrypted: boolean;
  encryptionKeyHash?: string;
  accessSigner?: string;
  parentPostId?: number; // For replies
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface PostInteraction {
  postId: number;
  user: string;
  interactionType: InteractionType;
  timestamp: string;
}

export interface Comment {
  id: number;
  postId: number;
  creator: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostStats {
  likes: number;
  replies: number;
  reports: number;
  views: number;
}

export interface BatchPostData {
  metadata: string;
  isGated: boolean;
  collectibleContract: string;
  collectibleId: number;
  postType: PostType;
}

export interface FeedConfig {
  isEnabled: boolean;
  maxPostsPerDay: number;
  lastResetTimestamp: number;
  postCountToday: number;
}

export class PostMinterService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    const xdcConfig = networksConfig.xdc;
    this.contractAddress = xdcConfig.postMinterAddress;
  }

  async initialize(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and connect your wallet.');
      }

      const xdcConfig = networksConfig.xdc;
      await this.requestXDCNetwork();

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        PostMinterABI.abi,
        this.signer
      );

      console.log('PostMinterService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PostMinterService:', error);
      throw error;
    }
  }

  private async requestXDCNetwork(): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available');
      }

      const xdcConfig = networksConfig.xdc;
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== `0x${xdcConfig.chainId.toString(16)}`) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${xdcConfig.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${xdcConfig.chainId.toString(16)}`,
                  chainName: 'XDC Network',
                  nativeCurrency: xdcConfig.nativeCurrency,
                  rpcUrls: [xdcConfig.rpcUrl],
                  blockExplorerUrls: [xdcConfig.blockExplorerUrl],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      } else {
        console.log('Already connected to XDC network');
      }
    } catch (error) {
      console.error('Failed to switch to XDC network:', error);
      throw error;
    }
  }

  // ===== POST CREATION FUNCTIONS =====

  // Create a new post
  async createPost(
    tribeId: number,
    metadata: PostMetadata,
    isGated: boolean = false,
    collectibleContract?: string,
    collectibleId?: number
  ): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const metadataURI = JSON.stringify(metadata);
      const collectibleContractAddress = collectibleContract || ethers.ZeroAddress;
      const collectibleIdValue = collectibleId || 0;

      console.log('Creating post with params:', {
        tribeId,
        metadataURI,
        isGated,
        collectibleContract: collectibleContractAddress,
        collectibleId: collectibleIdValue
      });

      const tx = await this.contract.createPost(
        tribeId,
        metadataURI,
        isGated,
        collectibleContractAddress,
        collectibleIdValue
      );

      const receipt = await tx.wait();
      console.log('Post created successfully:', receipt);

      // Get the post ID from the PostCreated event
      const postCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'PostCreated';
        } catch {
          return false;
        }
      });

      if (postCreatedEvent) {
        const parsed = this.contract!.interface.parseLog(postCreatedEvent);
        return Number(parsed!.args[0]); // postId
      }

      throw new Error('Post created but could not retrieve post ID');
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  // Create an encrypted post
  async createEncryptedPost(
    tribeId: number,
    metadata: string,
    encryptionKeyHash: string,
    accessSigner: string
  ): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.createEncryptedPost(
        tribeId,
        metadata,
        encryptionKeyHash,
        accessSigner
      );

      const receipt = await tx.wait();
      
      // Get the post ID from the EncryptedPostCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'EncryptedPostCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        return Number(parsed!.args[0]); // postId
      }

      throw new Error('Encrypted post created but could not retrieve post ID');
    } catch (error) {
      console.error('Failed to create encrypted post:', error);
      throw error;
    }
  }

  // Create a signature-gated post
  async createSignatureGatedPost(
    tribeId: number,
    metadata: string,
    encryptionKeyHash: string,
    accessSigner: string,
    collectibleContract: string,
    collectibleId: number
  ): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.createSignatureGatedPost(
        tribeId,
        metadata,
        encryptionKeyHash,
        accessSigner,
        collectibleContract,
        collectibleId
      );

      const receipt = await tx.wait();
      
      // Get the post ID from the SignatureGatedPostCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'SignatureGatedPostCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        return Number(parsed!.args[0]); // postId
      }

      throw new Error('Signature-gated post created but could not retrieve post ID');
    } catch (error) {
      console.error('Failed to create signature-gated post:', error);
      throw error;
    }
  }

  // Create a reply to an existing post
  async createReply(
    parentPostId: number,
    metadata: PostMetadata,
    isGated: boolean = false,
    collectibleContract?: string,
    collectibleId?: number
  ): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const metadataURI = JSON.stringify(metadata);
      const collectibleContractAddress = collectibleContract || ethers.ZeroAddress;
      const collectibleIdValue = collectibleId || 0;

      const tx = await this.contract.createReply(
        parentPostId,
        metadataURI,
        isGated,
        collectibleContractAddress,
        collectibleIdValue
      );

      const receipt = await tx.wait();
      
      // Get the reply ID from the PostCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'PostCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        return Number(parsed!.args[0]); // postId
      }

      throw new Error('Reply created but could not retrieve post ID');
    } catch (error) {
      console.error('Failed to create reply:', error);
      throw error;
    }
  }

  // Create multiple posts in batch
  async createBatchPosts(tribeId: number, posts: BatchPostData[]): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.createBatchPosts(tribeId, posts);
      const receipt = await tx.wait();
      
      // Get the post IDs from the BatchPostsCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'BatchPostsCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        return parsed!.args[2].map((id: any) => Number(id)); // postIds array
      }

      throw new Error('Batch posts created but could not retrieve post IDs');
    } catch (error) {
      console.error('Failed to create batch posts:', error);
      throw error;
    }
  }

  // ===== POST MANAGEMENT FUNCTIONS =====

  // Update an existing post
  async updatePost(postId: number, metadata: PostMetadata): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const metadataURI = JSON.stringify(metadata);

      console.log('Updating post with params:', {
        postId,
        metadataURI
      });

      const tx = await this.contract.updatePost(postId, metadataURI);
      await tx.wait();
      console.log('Post updated successfully');
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  // Delete a post (soft delete)
  async deletePost(postId: number): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.deletePost(postId);
      await tx.wait();
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }

  // Report a post
  async reportPost(postId: number, reason: string): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.reportPost(postId, reason);
      await tx.wait();
      console.log('Post reported successfully');
    } catch (error) {
      console.error('Failed to report post:', error);
      throw error;
    }
  }

  // ===== INTERACTION FUNCTIONS =====

  // Interact with a post (like, reply, report)
  async interactWithPost(postId: number, interactionType: InteractionType): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.interactWithPost(postId, interactionType);
      await tx.wait();
      console.log(`Post interaction (${InteractionType[interactionType]}) recorded successfully`);
    } catch (error) {
      console.error('Failed to interact with post:', error);
      throw error;
    }
  }

  // Get interaction count for a post
  async getInteractionCount(postId: number, interactionType: InteractionType): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const count = await this.contract.getInteractionCount(postId, interactionType);
      return Number(count);
    } catch (error) {
      console.error('Failed to get interaction count:', error);
      return 0;
    }
  }

  // ===== ACCESS CONTROL FUNCTIONS =====

  // Check if user can view a post
  async canViewPost(postId: number, viewer: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.canViewPost(postId, viewer);
    } catch (error) {
      console.error('Failed to check post access:', error);
      return false;
    }
  }

  // Authorize a user to view a post
  async authorizeViewer(postId: number, viewer: string): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.authorizeViewer(postId, viewer);
      await tx.wait();
      console.log('Viewer authorized successfully');
    } catch (error) {
      console.error('Failed to authorize viewer:', error);
      throw error;
    }
  }

  // Verify signature-based access
  async verifyPostAccess(postId: number, viewer: string, signature: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.verifyPostAccess(postId, viewer, signature);
    } catch (error) {
      console.error('Failed to verify post access:', error);
      return false;
    }
  }

  // ===== ENCRYPTION FUNCTIONS =====

  // Get decryption key for an encrypted post
  async getPostDecryptionKey(postId: number, viewer: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getPostDecryptionKey(postId, viewer);
    } catch (error) {
      console.error('Failed to get decryption key:', error);
      throw error;
    }
  }

  // Set tribe encryption key (admin only)
  async setTribeEncryptionKey(tribeId: number, encryptionKey: string): Promise<void> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.setTribeEncryptionKey(tribeId, encryptionKey);
      await tx.wait();
      console.log('Tribe encryption key set successfully');
    } catch (error) {
      console.error('Failed to set tribe encryption key:', error);
      throw error;
    }
  }

  // Derive shared key for a tribe member
  async deriveSharedKey(tribeId: number, member: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.deriveSharedKey(tribeId, member);
    } catch (error) {
      console.error('Failed to derive shared key:', error);
      throw error;
    }
  }

  // ===== QUERY FUNCTIONS =====

  // Get complete post data
  async getPost(postId: number): Promise<Post> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const postData = await this.contract.getPost(postId);
      
      // Parse metadata
      let metadata: PostMetadata;
      try {
        metadata = JSON.parse(postData.metadata);
      } catch {
        metadata = { content: postData.metadata, createdAt: new Date().toISOString() };
      }

      return {
        id: Number(postData.id),
        creator: postData.creator,
        tribeId: Number(postData.tribeId),
        metadata,
        isGated: postData.isGated,
        collectibleContract: postData.collectibleContract,
        collectibleId: Number(postData.collectibleId),
        isEncrypted: postData.isEncrypted,
        accessSigner: postData.accessSigner,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get post:', error);
      throw error;
    }
  }

  // Get post replies
  async getPostReplies(postId: number): Promise<number[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const replyIds = await this.contract.getPostReplies(postId);
      return replyIds.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get post replies:', error);
      return [];
    }
  }

  // Get posts by tribe with pagination
  async getPostsByTribe(tribeId: number, offset: number = 0, limit: number = 20): Promise<{ posts: Post[]; total: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [postIds, total] = await this.contract.getPostsByTribe(tribeId, offset, limit);
      
      const posts: Post[] = [];
      for (const postId of postIds) {
        try {
          const post = await this.getPost(Number(postId));
          posts.push(post);
        } catch (error) {
          console.warn(`Failed to get post ${postId}:`, error);
        }
      }

      return {
        posts,
        total: Number(total)
      };
    } catch (error) {
      console.error('Failed to get posts by tribe:', error);
      return { posts: [], total: 0 };
    }
  }

  // Get posts by user with pagination
  async getPostsByUser(user: string, offset: number = 0, limit: number = 20): Promise<{ posts: Post[]; total: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [postIds, total] = await this.contract.getPostsByUser(user, offset, limit);
      
      const posts: Post[] = [];
      for (const postId of postIds) {
        try {
          const post = await this.getPost(Number(postId));
          posts.push(post);
        } catch (error) {
          console.warn(`Failed to get post ${postId}:`, error);
        }
      }

      return {
        posts,
        total: Number(total)
      };
    } catch (error) {
      console.error('Failed to get posts by user:', error);
      return { posts: [], total: 0 };
    }
  }

  // Get posts by user in a specific tribe
  async getPostsByTribeAndUser(tribeId: number, user: string, offset: number = 0, limit: number = 20): Promise<{ posts: Post[]; total: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [postIds, total] = await this.contract.getPostsByTribeAndUser(tribeId, user, offset, limit);
      
      const posts: Post[] = [];
      for (const postId of postIds) {
        try {
          const post = await this.getPost(Number(postId));
          posts.push(post);
        } catch (error) {
          console.warn(`Failed to get post ${postId}:`, error);
        }
      }

      return {
        posts,
        total: Number(total)
      };
    } catch (error) {
      console.error('Failed to get posts by tribe and user:', error);
      return { posts: [], total: 0 };
    }
  }

  // Get personalized feed for user
  async getFeedForUser(user: string, offset: number = 0, limit: number = 20): Promise<{ posts: Post[]; total: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [postIds, total] = await this.contract.getFeedForUser(user, offset, limit);
      
      const posts: Post[] = [];
      for (const postId of postIds) {
        try {
          const post = await this.getPost(Number(postId));
          posts.push(post);
        } catch (error) {
          console.warn(`Failed to get post ${postId}:`, error);
        }
      }

      return {
        posts,
        total: Number(total)
      };
    } catch (error) {
      console.error('Failed to get feed for user:', error);
      return { posts: [], total: 0 };
    }
  }

  // ===== RATE LIMITING FUNCTIONS =====

  // Get cooldown for a post type
  async getPostTypeCooldown(postType: PostType): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const cooldown = await this.contract.getPostTypeCooldown(postType);
      return Number(cooldown);
    } catch (error) {
      console.error('Failed to get post type cooldown:', error);
      return 0;
    }
  }

  // Get remaining cooldown for user and post type
  async getRemainingCooldown(user: string, postType: PostType): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const remaining = await this.contract.getRemainingCooldown(user, postType);
      return Number(remaining);
    } catch (error) {
      console.error('Failed to get remaining cooldown:', error);
      return 0;
    }
  }

  // Get batch posting limits
  async getBatchPostingLimits(): Promise<{ maxBatchSize: number; batchCooldown: number }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [maxBatchSize, batchCooldown] = await this.contract.getBatchPostingLimits();
      return {
        maxBatchSize: Number(maxBatchSize),
        batchCooldown: Number(batchCooldown)
      };
    } catch (error) {
      console.error('Failed to get batch posting limits:', error);
      return { maxBatchSize: 0, batchCooldown: 0 };
    }
  }

  // ===== FEED MANAGEMENT FUNCTIONS =====

  // Check if feed is enabled for tribe
  async isFeedEnabled(tribeId: number): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.isFeedEnabled(tribeId);
    } catch (error) {
      console.error('Failed to check if feed is enabled:', error);
      return false;
    }
  }

  // Get feed configuration for tribe
  async getFeedConfig(tribeId: number): Promise<FeedConfig> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [isEnabled, maxPostsPerDay, postCountToday] = await this.contract.getFeedConfig(tribeId);
      return {
        isEnabled,
        maxPostsPerDay: Number(maxPostsPerDay),
        lastResetTimestamp: 0, // This might need to be fetched separately
        postCountToday: Number(postCountToday)
      };
    } catch (error) {
      console.error('Failed to get feed config:', error);
      return {
        isEnabled: false,
        maxPostsPerDay: 0,
        lastResetTimestamp: 0,
        postCountToday: 0
      };
    }
  }

  // ===== UTILITY FUNCTIONS =====

  // Validate metadata format
  async validateMetadata(metadata: string, postType: PostType): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.validateMetadata(metadata, postType);
    } catch (error) {
      console.error('Failed to validate metadata:', error);
      return false;
    }
  }

  // Generate post key
  async generatePostKey(postId: number): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.generatePostKey(postId);
    } catch (error) {
      console.error('Failed to generate post key:', error);
      throw error;
    }
  }

  // Get total posts count
  async getTotalPosts(): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const nextId = await this.contract.nextPostId();
      return Number(nextId) - 1; // nextPostId is the next available ID
    } catch (error) {
      console.error('Failed to get total posts:', error);
      return 0;
    }
  }

  // Check if user is member of tribe (for validation)
  async isUserMemberOfTribe(user: string, tribeId: number): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // This would typically call the TribeController contract
      // For now, we'll assume the contract handles this validation
      return true;
    } catch (error) {
      console.error('Failed to check tribe membership:', error);
      return false;
    }
  }

  // Get post statistics
  async getPostStats(postId: number): Promise<PostStats> {
    try {
      const likes = await this.getInteractionCount(postId, InteractionType.LIKE);
      const replies = await this.getInteractionCount(postId, InteractionType.REPLY);
      const reports = await this.getInteractionCount(postId, InteractionType.REPORT);
      
      return {
        likes,
        replies,
        reports,
        views: 0 // Views might not be tracked in the contract
      };
    } catch (error) {
      console.error('Failed to get post stats:', error);
      return {
        likes: 0,
        replies: 0,
        reports: 0,
        views: 0
      };
    }
  }

  // Legacy function for backward compatibility
  async createComment(postId: number, content: string): Promise<number> {
    // Use createReply instead
    const metadata: PostMetadata = {
      content,
      createdAt: new Date().toISOString()
    };
    
    return await this.createReply(postId, metadata);
  }

  // Legacy function for backward compatibility
  async getPostComments(postId: number): Promise<Comment[]> {
    try {
      const replyIds = await this.getPostReplies(postId);
      const comments: Comment[] = [];
      
      for (const replyId of replyIds) {
        try {
          const post = await this.getPost(replyId);
          comments.push({
            id: post.id,
            postId: post.parentPostId || postId,
            creator: post.creator,
            content: post.metadata.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
          });
        } catch (error) {
          console.warn(`Failed to get comment ${replyId}:`, error);
        }
      }
      
      return comments;
    } catch (error) {
      console.error('Failed to get post comments:', error);
      return [];
    }
  }


}

export const postMinterService = new PostMinterService(); 