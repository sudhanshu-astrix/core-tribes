import type { User, Community, Post, CommunityMember, FeedItem, Token, LiveSession, Proposal } from '../types';

// Update mockUser with points data
export const mockUser: User = {
  id: 'user-1',
  username: 'web3_enthusiast',
  walletAddress: '0x1234...5678',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
  joinedAt: '2023-06-15T10:30:00Z',
  communities: ['comm-1', 'comm-2', 'comm-3'],
  tokens: [
    {
      id: 'token-1',
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      balance: 1.5,
      price: 2500,
      type: 'fungible',
      contractAddress: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'token-2',
      name: 'TribesDAO',
      symbol: 'TRIBE',
      logo: 'https://cryptologos.cc/logos/tribe-tribe-logo.png',
      balance: 1200,
      price: 0.75,
      type: 'fungible',
      contractAddress: '0x1234567890123456789012345678901234567890',
    },
  ],
  points: {
    total: 2750,
    breakdown: {
      posts: 450,
      comments: 320,
      reactions: 180,
      referrals: 300,
      events: 800,
      governance: 700,
    },
    level: 5,
    rank: 'Web3 Pioneer',
    nextLevelProgress: 75,
  },
};

// Second mock user for more diverse data
export const mockUser2: User = {
  id: 'user-2',
  username: 'DAOContributor',
  walletAddress: '0xABCD...EFGH',
  avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300',
  joinedAt: '2023-07-01T12:00:00Z',
  communities: ['comm-3'],
  tokens: [
    {
      id: 'token-3',
      name: 'GovernanceToken',
      symbol: 'GOV',
      logo: 'https://example.com/gov-logo.png',
      balance: 500,
      type: 'fungible',
      contractAddress: '0xGOVGOVGOVGOVGOVGOVGOVGOVGOVGOVGOVGOVGOV',
    }
  ],
  points: {
    total: 1500,
    breakdown: { posts: 200, comments: 150, reactions: 100, referrals: 0, events: 500, governance: 550 },
    level: 3,
    rank: 'Active Voter',
    nextLevelProgress: 50,
  },
};

// Updated mock communities data
export const mockCommunities: Community[] = [
  {
    id: 'community-1',
    name: 'Web3 Developers',
    description: 'A community for Web3 developers to share knowledge and collaborate',
    logo: 'https://picsum.photos/200',
    memberCount: 1234,
    isPrivate: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: mockUser.id,
    pointsConfig: {
      createPost: 10,
      createEvent: 15,
      createProposal: 20,
      voteProposal: 5,
      commentOrReply: 2
    },
    levelTiers: [
      { level: 1, rankName: 'Novice', xpThreshold: 0 },
      { level: 2, rankName: 'Apprentice', xpThreshold: 100 },
      { level: 3, rankName: 'Contributor', xpThreshold: 500 },
      { level: 4, rankName: 'Expert', xpThreshold: 1000 },
      { level: 5, rankName: 'Master', xpThreshold: 2000 }
    ],
    xpCooldowns: [
      { action: 'createPost', minutes: 30 },
      { action: 'createEvent', minutes: 60 },
      { action: 'createProposal', minutes: 120 },
      { action: 'voteProposal', minutes: 15 },
      { action: 'commentOrReply', minutes: 5 }
    ],
    xpMultipliers: [
      { action: 'createPost', consecutiveActions: 3, multiplier: 1.5 },
      { action: 'createPost', consecutiveActions: 5, multiplier: 2 },
      { action: 'createEvent', consecutiveActions: 2, multiplier: 1.5 },
      { action: 'createProposal', consecutiveActions: 2, multiplier: 1.5 },
      { action: 'voteProposal', consecutiveActions: 3, multiplier: 1.5 },
      { action: 'commentOrReply', consecutiveActions: 5, multiplier: 1.5 }
    ],
    xpBoosts: [
      {
        id: '1',
        name: 'Weekend Engagement Boost',
        description: '2x XP for all actions during weekends',
        multiplier: 2,
        startTime: '2024-03-23T00:00:00Z',
        endTime: '2024-03-24T23:59:59Z',
        actions: ['createPost', 'createEvent', 'createProposal', 'voteProposal', 'commentOrReply'],
        isActive: true
      },
      {
        id: '2',
        name: 'Governance Month',
        description: '1.5x XP for proposal-related actions',
        multiplier: 1.5,
        startTime: '2024-03-01T00:00:00Z',
        endTime: '2024-03-31T23:59:59Z',
        actions: ['createProposal', 'voteProposal'],
        isActive: true
      }
    ],
    roles: [
      {
        id: 'admin',
        name: 'Admin',
        description: 'Full control over the community',
        permissions: [
          'create_post',
          'create_event',
          'create_proposal',
          'vote_proposal',
          'manage_roles',
          'manage_events',
          'manage_posts',
          'manage_proposals',
          'manage_members',
          'manage_settings',
          'view_analytics'
        ],
        color: '#FF0000',
        isDefault: false
      },
      {
        id: 'moderator',
        name: 'Moderator',
        description: 'Can manage content and moderate discussions',
        permissions: [
          'create_post',
          'create_event',
          'create_proposal',
          'vote_proposal',
          'manage_posts',
          'manage_events',
          'manage_proposals'
        ],
        color: '#00FF00',
        isDefault: false
      },
      {
        id: 'member',
        name: 'Member',
        description: 'Regular community member',
        permissions: [
          'create_post',
          'create_event',
          'create_proposal',
          'vote_proposal'
        ],
        color: '#0000FF',
        isDefault: true
      },
      {
        id: 'elite',
        name: 'Elite Member',
        description: 'High-level community member',
        permissions: [
          'create_post',
          'create_event',
          'create_proposal',
          'vote_proposal',
          'view_analytics'
        ],
        color: '#FFD700',
        levelRequired: 10
      }
    ],
    memberRoles: [
      {
        roleId: 'admin',
        userId: mockUser.id,
        assignedBy: mockUser.id,
        assignedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'community-2',
    name: 'NFT Creators',
    description: 'Community for digital artists and NFT enthusiasts',
    logo: 'https://images.pexels.com/photos/8369590/pexels-photo-8369590.jpeg?auto=compress&cs=tinysrgb&w=300',
    bannerImage: 'https://images.pexels.com/photos/8369590/pexels-photo-8369590.jpeg?auto=compress&cs=tinysrgb&w=1200',
    memberCount: 3800,
    rules: ['Only post original NFT artwork or relevant discussions.', 'No unauthorized sharing of private sale info.', 'Support fellow artists!'],
    isPrivate: false,
    creatorId: 'user-1',
    moderatorIds: ['user-1'],
    createdAt: '2023-02-20T11:30:00Z',
    pointsConfig: {
      postCreation: 8,
      commentOrReply: 2,
      reactionGiven: 1,
      reactionReceived: 2,
      eventParticipation: 20,
      eventCreation: 12,
      proposalVote: 4,
      proposalCreation: 15,
      referral: 25,
      dailyLogin: 5,
    },
    levelTiers: [
      { level: 1, rankName: 'Artist', xpThreshold: 0 },
      { level: 2, rankName: 'Creator', xpThreshold: 80 },
      { level: 3, rankName: 'Master', xpThreshold: 250 },
    ],
    xpCooldowns: [
      { action: 'postCreation', minutes: 10 },
      { action: 'commentOrReply', minutes: 2 },
      { action: 'reactionGiven', minutes: 2 },
      { action: 'reactionReceived', minutes: 2 },
      { action: 'eventParticipation', minutes: 60 },
      { action: 'eventCreation', minutes: 15 },
      { action: 'proposalVote', minutes: 15 },
      { action: 'proposalCreation', minutes: 40 },
      { action: 'referral', minutes: 120 },
      { action: 'dailyLogin', minutes: 1440 },
    ],
  },
  {
    id: 'community-3',
    name: 'DAO Governance',
    description: 'Discussing the future of decentralized organizations',
    logo: 'https://images.pexels.com/photos/8369741/pexels-photo-8369741.jpeg?auto=compress&cs=tinysrgb&w=300',
    bannerImage: 'https://images.pexels.com/photos/8369741/pexels-photo-8369741.jpeg?auto=compress&cs=tinysrgb&w=1200',
    memberCount: 2900,
    rules: ['All proposals must have a clear rationale.', 'Debate respectfully.', 'Vote based on conviction.'],
    isPrivate: true,
    creatorId: 'user-2',
    moderatorIds: ['user-2', 'user-1'],
    createdAt: '2023-03-10T16:45:00Z',
    pointsConfig: {
      postCreation: 6,
      commentOrReply: 2,
      reactionGiven: 1,
      reactionReceived: 2,
      eventParticipation: 15,
      eventCreation: 10,
      proposalVote: 10,
      proposalCreation: 25,
      referral: 20,
      dailyLogin: 5,
    },
    levelTiers: [
      { level: 1, rankName: 'Member', xpThreshold: 0 },
      { level: 2, rankName: 'Voter', xpThreshold: 60 },
      { level: 3, rankName: 'Governor', xpThreshold: 200 },
    ],
    xpCooldowns: [
      { action: 'postCreation', minutes: 7 },
      { action: 'commentOrReply', minutes: 2 },
      { action: 'reactionGiven', minutes: 2 },
      { action: 'reactionReceived', minutes: 2 },
      { action: 'eventParticipation', minutes: 60 },
      { action: 'eventCreation', minutes: 20 },
      { action: 'proposalVote', minutes: 20 },
      { action: 'proposalCreation', minutes: 60 },
      { action: 'referral', minutes: 180 },
      { action: 'dailyLogin', minutes: 1440 },
    ],
  },
];

// New mockPosts array
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: {
      id: mockUser.id,
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    community: {
      id: 'community-1',
      name: mockCommunities[0].name,
      logo: mockCommunities[0].logo,
    },
    content: 'Just deployed my first smart contract on Ethereum! 🚀 Looking for feedback on gas optimization.',
    createdAt: '2024-02-15T14:30:00Z',
    likes: 42,
    comments: 12,
    userHasLiked: false,
    pointsEarned: 10,
  },
  {
    id: 'post-2',
    author: {
      id: mockUser.id,
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    community: {
      id: 'community-2',
      name: mockCommunities[1].name,
      logo: mockCommunities[1].logo,
    },
    content: 'Excited to share my latest NFT drop! Check it out on OpenSea. #NFT #DigitalArt What do you think of the new style?',
    createdAt: '2024-02-16T11:00:00Z',
    likes: 120,
    comments: 35,
    userHasLiked: true,
    image: 'https://images.pexels.com/photos/7387130/pexels-photo-7387130.jpeg?auto=compress&cs=tinysrgb&w=600',
    pointsEarned: 15,
  },
  {
    id: 'post-3',
    author: {
      id: mockUser2.id,
      username: mockUser2.username,
      avatar: mockUser2.avatar,
    },
    community: {
      id: 'community-3',
      name: mockCommunities[2].name,
      logo: mockCommunities[2].logo,
    },
    content: 'Great discussion happening in the DAO about the new treasury management proposal. What are your thoughts on clause 3.b?',
    createdAt: '2024-02-15T18:45:00Z',
    likes: 75,
    comments: 22,
    userHasLiked: false,
    pointsEarned: 5,
  },
  {
    id: 'post-4',
    author: {
      id: mockUser.id,
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    community: {
      id: 'community-1',
      name: mockCommunities[0].name,
      logo: mockCommunities[0].logo,
    },
    content: 'What are the best Layer 2 solutions for DeFi applications right now? Considering Arbitrum and Optimism.',
    createdAt: '2024-02-18T10:00:00Z',
    likes: 68,
    comments: 19,
    userHasLiked: false,
  },
];

// New mockCommunityMembers array
export const mockCommunityMembers: CommunityMember[] = [
  {
    communityId: 'community-1',
    userId: mockUser.id,
    role: 'admin',
    joinedAt: '2024-01-01T10:00:00Z',
    currentXp: 1200,
    currentLevel: 4,
    lastActionTimestamps: { postCreation: '2024-06-01T10:00:00Z' },
    roles: ['admin']
  },
  {
    communityId: 'community-1',
    userId: 'user-2',
    role: 'member',
    joinedAt: '2024-01-10T12:00:00Z',
    currentXp: 300,
    currentLevel: 2,
    lastActionTimestamps: { commentOrReply: '2024-06-01T09:00:00Z' },
    roles: ['member']
  },
  {
    communityId: 'community-2',
    userId: 'user-1',
    role: 'admin',
    joinedAt: '2023-02-20T11:30:00Z',
    currentXp: 200,
    currentLevel: 3,
    lastActionTimestamps: { eventParticipation: '2024-06-01T08:00:00Z' }
  },
  {
    communityId: 'community-3',
    userId: 'user-2',
    role: 'admin',
    joinedAt: '2023-03-10T16:45:00Z',
    currentXp: 75,
    currentLevel: 2,
    lastActionTimestamps: { postCreation: '2024-06-01T07:00:00Z' }
  },
  {
    communityId: 'community-3',
    userId: 'user-1',
    role: 'moderator',
    joinedAt: '2023-04-01T12:00:00Z',
    currentXp: 10,
    currentLevel: 1,
    lastActionTimestamps: {}
  }
];

// Keeping mockFeedItems for now, might be refactored later to use mockPosts, mockProposals, mockEvents
export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Implement Token Staking Rewards',
    description: 'Proposal to introduce staking rewards for community token holders',
    options: [
      { id: 'opt1', text: 'Yes, implement staking', votes: 150, percentage: 83 },
      { id: 'opt2', text: 'No, not at this time', votes: 30, percentage: 17 }
    ],
    status: 'active',
    endTime: '2024-12-01T00:00:00Z',
    community: {
      id: 'community-3',
      name: mockCommunities[2].name,
      logo: mockCommunities[2].logo,
    },
    userVote: undefined,
    totalVotes: 180,
    pointsReward: 200,
  }
];

// Add author property to mockProposals for compatibility with ProposalCard
export const mockProposalsWithAuthor = mockProposals.map(proposal => ({
  ...proposal,
  author: {
    id: mockUser.id,
    username: mockUser.username,
    avatar: mockUser.avatar,
    address: mockUser.walletAddress
  },
  createdAt: proposal.endTime, // Use endTime as createdAt for now
  endDate: proposal.endTime,
  votes: {
    for: proposal.options?.find(opt => opt.text.toLowerCase().includes('yes'))?.votes || 0,
    against: proposal.options?.find(opt => opt.text.toLowerCase().includes('no'))?.votes || 0,
    abstain: 0
  },
  userVote: proposal.userVote as 'for' | 'against' | 'abstain' | null,
  quorum: 100,
  minVotes: 50
}));

export const mockLiveSessions: LiveSession[] = [
  {
    id: 'event-1',
    title: 'NFT Artist Workshop',
    description: 'Learn advanced techniques for creating unique NFT artwork',
    startTime: '2024-12-15T18:00:00Z',
    endTime: '2024-12-15T20:00:00Z',
    type: 'ama',
    status: 'upcoming',
    host: {
      id: mockUser.id,
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    community: {
      id: 'community-2',
      name: mockCommunities[1].name,
      logo: mockCommunities[1].logo,
    },
    participants: 150,
    maxParticipants: 200,
    joinUrl: 'https://example.com/live/event-1',
    pointsReward: 50,
  }
];

export const mockFeedItems: FeedItem[] = [
  {
    type: 'post',
    data: mockPosts[0]
  },
  {
    type: 'proposal',
    data: mockProposals[0]
  },
  {
    type: 'event',
    data: mockLiveSessions[0]
  },
  {
    type: 'post',
    data: mockPosts[1]
  },
  {
    type: 'post',
    data: mockPosts[2]
  }
];