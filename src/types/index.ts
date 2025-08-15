// User types
export interface User {
  id: string;
  username: string;
  walletAddress: string;
  avatar?: string;
  bio?: string;
  socialLinks?: [{[key: string]: string}] | [];
  joinedAt: string;
  communities: string[];
  tokens: Token[];
  points: {
    total: number;
    breakdown: {
      posts: number;
      comments: number;
      reactions: number;
      referrals: number;
      events: number;
      governance: number;
    };
    level: number;
    rank: string;
    nextLevelProgress: number;
  };
}

// Community types
export interface Community {
  id: string;
  name: string;
  description: string;
  logo: string;
  bannerImage?: string;
  memberCount: number;
  rules?: string[];
  isPrivate?: boolean;
  creatorId?: string;
  moderatorIds?: string[];
  token?: string;
  createdAt: string;
  pointsConfig?: {
    postCreation: number;
    reactionGiven?: number;
    eventParticipation: number;
    proposalVote: number;
    commentOrReply?: number;
  };
  levelTiers?: { level: number; rankName: string; xpThreshold: number; roleId?: string; }[];
  xpCooldowns?: { action: keyof NonNullable<Community['pointsConfig']>; minutes: number; }[];
  xpMultipliers?: { action: keyof NonNullable<Community['pointsConfig']>; consecutiveActions: number; multiplier: number; }[];
  xpBoosts?: {
    id: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    multiplier: number;
    actions: (keyof NonNullable<Community['pointsConfig']>)[];
    isActive: boolean;
  }[];
  roles?: Role[];
  memberRoles?: CommunityRole[];
}

// Post types
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
    logo: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  userHasLiked?: boolean;
  image?: string;
  pointsEarned?: number;
}

// Live Session types
export interface LiveSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'ama' | 'meeting' | 'call';
  status: 'upcoming' | 'live' | 'ended';
  host: {
    id: string;
    username: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
    logo: string;
  };
  participants: number;
  maxParticipants?: number;
  joinUrl?: string;
  recordingUrl?: string;
  pointsReward?: number;
}

// Proposal types
export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  totalVotes: number;
  userVote?: 'for' | 'against' | 'abstain' | null;
  options: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }[];
  community: {
    id: string;
    name: string;
    logo?: string;
  };
  endTime: string;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  community: {
    id: string;
    name: string;
    logo: string;
  };
  attendees: number;
  userRsvp?: boolean;
  image?: string;
  pointsReward?: number;
}

// Token types
export interface Token {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  balance: number;
  price?: number;
  type: 'fungible' | 'nft';
  contractAddress: string;
}

// Feed item type (union of post, proposal, and event)
export type FeedItem = 
  | { type: 'post'; data: Post }
  | { type: 'proposal'; data: Proposal }
  | { type: 'event'; data: LiveSession };

// New CommunityMember type
export interface CommunityMember {
  communityId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  currentXp: number;
  currentLevel: number;
  lastActionTimestamps?: {
    postCreation?: string;
    reactionGiven?: string;
    eventParticipation?: string;
    proposalVote?: string;
    commentOrReply?: string;
  };
  consecutiveActions?: {
    postCreation?: number;
    reactionGiven?: number;
    eventParticipation?: number;
    proposalVote?: number;
    commentOrReply?: number;
  };
  roles?: string[]; // Array of role IDs
}

export type Permission = 
  | 'create_post'
  | 'create_event'
  | 'create_proposal'
  | 'vote_proposal'
  | 'manage_roles'
  | 'manage_events'
  | 'manage_posts'
  | 'manage_proposals'
  | 'manage_members'
  | 'manage_settings'
  | 'view_analytics';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  isDefault?: boolean;
  levelRequired?: number;
}

export interface CommunityRole {
  roleId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
}