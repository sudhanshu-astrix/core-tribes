import { EventWithMetadata } from '../services/EventContract';

// Demo Events Data
export const demoEvents: EventWithMetadata[] = [
  // Tribe 0 Events
  {
    eventId: 1,
    metadataURI: '',
    organizer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    maxTickets: 200,
    ticketsSold: 135,
    price: 0, // Free event
    active: true,
    isPrivate: false,
    metadata: {
      title: 'Hangout with Mega Core Team',
      description: "It's been a long time since the core team has had a direct chat with you all. Hang out with Brother Bing, Bread, Namik, Lei, M.u along with a special guest - this Friday! We want to share some mega updates and maybe give away some mega merch to participants!",
      startDateTime: '2024-05-30T19:00:00Z',
      endDateTime: '2024-05-30T20:00:00Z',
      location: 'Discord Voice Channel #general',
      locationType: 'virtual',
      tribeId: 0,
      createdBy: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      createdAt: '2024-05-25T10:00:00Z'
    }
  },
  {
    eventId: 2,
    metadataURI: '',
    organizer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    maxTickets: 50,
    ticketsSold: 23,
    price: 1000000000000000000, // 1 XDC in wei
    active: true,
    isPrivate: true,
    metadata: {
      title: 'Exclusive NFT Workshop',
      description: 'Join us for an exclusive workshop on creating and trading NFTs. Learn from industry experts and get hands-on experience with the latest tools and techniques.',
      startDateTime: '2024-06-15T14:00:00Z',
      endDateTime: '2024-06-15T16:00:00Z',
      location: 'Zoom Meeting Room',
      locationType: 'virtual',
      tribeId: 0,
      createdBy: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      createdAt: '2024-05-26T15:30:00Z'
    }
  },
  // Tribe 1 Events
  {
    eventId: 3,
    metadataURI: '',
    organizer: '0x1234567890123456789012345678901234567890',
    maxTickets: 100,
    ticketsSold: 67,
    price: 0,
    active: true,
    isPrivate: false,
    metadata: {
      title: 'Community Meetup - Downtown',
      description: 'Let\'s meet in person! Join us for an evening of networking, discussions about the future of blockchain, and some great food. All community members welcome!',
      startDateTime: '2024-06-20T18:00:00Z',
      endDateTime: '2024-06-20T21:00:00Z',
      location: 'Downtown Conference Center, 123 Main St',
      locationType: 'physical',
      tribeId: 1,
      createdBy: '0x1234567890123456789012345678901234567890',
      createdAt: '2024-05-27T09:15:00Z'
    }
  },
  {
    eventId: 4,
    metadataURI: '',
    organizer: '0x1234567890123456789012345678901234567890',
    maxTickets: 75,
    ticketsSold: 45,
    price: 500000000000000000, // 0.5 XDC in wei
    active: true,
    isPrivate: false,
    metadata: {
      title: 'DeFi Strategy Session',
      description: 'Deep dive into DeFi strategies, yield farming, and risk management. Perfect for both beginners and advanced users.',
      startDateTime: '2024-06-25T15:00:00Z',
      endDateTime: '2024-06-25T17:00:00Z',
      location: 'Virtual Conference Room',
      locationType: 'virtual',
      tribeId: 1,
      createdBy: '0x1234567890123456789012345678901234567890',
      createdAt: '2024-05-28T11:20:00Z'
    }
  },
  // Tribe 2 Events
  {
    eventId: 5,
    metadataURI: '',
    organizer: '0x9876543210987654321098765432109876543210',
    maxTickets: 150,
    ticketsSold: 89,
    price: 0,
    active: true,
    isPrivate: false,
    metadata: {
      title: 'Blockchain Gaming Expo',
      description: 'Experience the future of gaming! Showcase of the latest blockchain games, NFT collectibles, and gaming infrastructure.',
      startDateTime: '2024-07-10T10:00:00Z',
      endDateTime: '2024-07-10T18:00:00Z',
      location: 'Gaming Convention Center',
      locationType: 'physical',
      tribeId: 2,
      createdBy: '0x9876543210987654321098765432109876543210',
      createdAt: '2024-05-29T14:45:00Z'
    }
  },
  {
    eventId: 6,
    metadataURI: '',
    organizer: '0x9876543210987654321098765432109876543210',
    maxTickets: 30,
    ticketsSold: 12,
    price: 2000000000000000000, // 2 XDC in wei
    active: true,
    isPrivate: true,
    metadata: {
      title: 'VIP Gaming Tournament',
      description: 'Exclusive gaming tournament with high-value prizes. Only for elite members with special access.',
      startDateTime: '2024-07-15T19:00:00Z',
      endDateTime: '2024-07-15T23:00:00Z',
      location: 'Private Gaming Arena',
      locationType: 'physical',
      tribeId: 2,
      createdBy: '0x9876543210987654321098765432109876543210',
      createdAt: '2024-05-30T16:30:00Z'
    }
  }
];

// Demo Posts Data
export const demoPosts = [
  // Tribe 0 Posts
  {
    id: '1',
    type: 'text',
    title: 'Welcome to Our Community! 🎉',
    content: 'Hey everyone! Welcome to our amazing community. We\'re excited to have you here and can\'t wait to see what we\'ll build together. Feel free to introduce yourself and share your thoughts on the future of blockchain technology.',
    author: {
      id: '1',
      username: 'CommunityAdmin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-25T10:00:00Z',
    likes: 45,
    comments: [
      {
        id: '1',
        content: 'Excited to be here! 🚀',
        author: {
          id: '2',
          username: 'CryptoFan',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        createdAt: '2024-05-25T10:30:00Z',
        likes: 12
      },
      {
        id: '2',
        content: 'Great community so far!',
        author: {
          id: '3',
          username: 'BlockchainDev',
          avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        createdAt: '2024-05-25T11:15:00Z',
        likes: 8
      }
    ],
    tags: ['welcome', 'community', 'blockchain']
  },
  {
    id: '2',
    type: 'image',
    title: 'Our New Office Space! 🏢',
    content: 'Check out our amazing new office space! We\'ve been working hard to create the perfect environment for innovation and collaboration. What do you think?',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      id: '1',
      username: 'CommunityAdmin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-26T14:00:00Z',
    likes: 89,
    comments: [
      {
        id: '3',
        content: 'Looks amazing! 😍',
        author: {
          id: '2',
          username: 'CryptoFan',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        createdAt: '2024-05-26T14:30:00Z',
        likes: 15
      }
    ],
    tags: ['office', 'workspace', 'innovation']
  },
  // Tribe 1 Posts
  {
    id: '3',
    type: 'text',
    title: 'Weekly Development Update 📊',
    content: 'Here\'s what we\'ve been working on this week:\n\n• Improved smart contract security\n• Enhanced UI/UX for mobile users\n• New governance features\n• Bug fixes and performance improvements\n\nStay tuned for more updates!',
    author: {
      id: '3',
      username: 'BlockchainDev',
      avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '1',
      name: 'DeFi Masters',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-27T09:00:00Z',
    likes: 67,
    comments: [],
    tags: ['development', 'update', 'progress']
  },
  {
    id: '4',
    type: 'text',
    title: 'DeFi Yield Farming Guide 🚀',
    content: 'Just published a comprehensive guide on yield farming strategies. Learn about the best protocols, risk management, and how to maximize your returns in the DeFi space.',
    author: {
      id: '4',
      username: 'DeFiExpert',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '1',
      name: 'DeFi Masters',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-28T16:00:00Z',
    likes: 123,
    comments: [
      {
        id: '4',
        content: 'This guide is gold! Thanks for sharing.',
        author: {
          id: '5',
          username: 'YieldFarmer',
          avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        createdAt: '2024-05-28T16:30:00Z',
        likes: 8
      }
    ],
    tags: ['defi', 'yield-farming', 'guide', 'education']
  },
  // Tribe 2 Posts
  {
    id: '5',
    type: 'image',
    title: 'New Game Launch! 🎮',
    content: 'Our latest blockchain game is now live! Experience true ownership of in-game assets and earn while you play. Check out the trailer and join the beta!',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      id: '6',
      username: 'GameDev',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x9876543210987654321098765432109876543210'
    },
    community: {
      id: '2',
      name: 'Gaming Guild',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-29T12:00:00Z',
    likes: 234,
    comments: [
      {
        id: '5',
        content: 'Can\'t wait to try it! 🎮',
        author: {
          id: '7',
          username: 'GamerPro',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        createdAt: '2024-05-29T12:15:00Z',
        likes: 12
      }
    ],
    tags: ['gaming', 'blockchain', 'nft', 'launch']
  },
  {
    id: '6',
    type: 'text',
    title: 'Gaming Tournament Results 🏆',
    content: 'Congratulations to all participants in our monthly gaming tournament! Here are the winners:\n\n🥇 First Place: CryptoGamer123\n🥈 Second Place: NFTMaster\n🥉 Third Place: BlockchainWarrior\n\nAmazing competition everyone! Next tournament starts next week.',
    author: {
      id: '6',
      username: 'GameDev',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x9876543210987654321098765432109876543210'
    },
    community: {
      id: '2',
      name: 'Gaming Guild',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-30T18:00:00Z',
    likes: 156,
    comments: [],
    tags: ['tournament', 'winners', 'gaming', 'competition']
  }
];

// Demo Polls Data
export const demoPolls = [
  // Tribe 0 Polls
  {
    id: '1',
    title: 'What should be our next community event?',
    description: 'Help us decide what type of event to organize next. Your vote matters!',
    options: [
      { id: '1', text: 'Technical Workshop', votes: 45 },
      { id: '2', text: 'Networking Meetup', votes: 32 },
      { id: '3', text: 'AMA Session', votes: 28 },
      { id: '4', text: 'Hackathon', votes: 19 }
    ],
    author: {
      id: '1',
      username: 'CommunityAdmin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-25T12:00:00Z',
    endDate: '2024-06-01T12:00:00Z',
    totalVotes: 124,
    userVote: null,
    isActive: true
  },
  {
    id: '2',
    title: 'Should we implement a new governance token?',
    description: 'We\'re considering introducing a new governance token for community decisions. What do you think?',
    options: [
      { id: '1', text: 'Yes, implement new token', votes: 67 },
      { id: '2', text: 'No, keep current system', votes: 23 },
      { id: '3', text: 'Need more discussion', votes: 15 }
    ],
    author: {
      id: '3',
      username: 'BlockchainDev',
      avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-26T15:00:00Z',
    endDate: '2024-06-05T15:00:00Z',
    totalVotes: 105,
    userVote: '1',
    isActive: true
  },
  // Tribe 1 Polls
  {
    id: '3',
    title: 'Which DeFi protocol should we focus on next?',
    description: 'We\'re planning to create educational content and tutorials. Which protocol interests you most?',
    options: [
      { id: '1', text: 'Uniswap V4', votes: 89 },
      { id: '2', text: 'Compound Finance', votes: 45 },
      { id: '3', text: 'Aave Protocol', votes: 67 },
      { id: '4', text: 'Curve Finance', votes: 34 }
    ],
    author: {
      id: '4',
      username: 'DeFiExpert',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '1',
      name: 'DeFi Masters',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-27T10:00:00Z',
    endDate: '2024-06-03T10:00:00Z',
    totalVotes: 235,
    userVote: null,
    isActive: true
  },
  // Tribe 2 Polls
  {
    id: '4',
    title: 'What type of game should we develop next?',
    description: 'Our development team is ready to start a new project. What genre would you like to see?',
    options: [
      { id: '1', text: 'RPG with NFT characters', votes: 156 },
      { id: '2', text: 'Strategy game', votes: 78 },
      { id: '3', text: 'Racing game', votes: 45 },
      { id: '4', text: 'Puzzle game', votes: 23 }
    ],
    author: {
      id: '6',
      username: 'GameDev',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x9876543210987654321098765432109876543210'
    },
    community: {
      id: '2',
      name: 'Gaming Guild',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-28T14:00:00Z',
    endDate: '2024-06-04T14:00:00Z',
    totalVotes: 302,
    userVote: '1',
    isActive: true
  }
];

// Demo Governance Proposals Data
export const demoProposals = [
  // Tribe 0 Proposals
  {
    id: '1',
    title: 'Increase Community Treasury Allocation',
    description: 'Proposal to increase the community treasury allocation from 10% to 15% of all transaction fees to fund more community initiatives and events.',
    author: {
      id: '1',
      username: 'CommunityAdmin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-25T10:00:00Z',
    endDate: '2024-06-02T10:00:00Z',
    status: 'active',
    votes: {
      for: 156,
      against: 23,
      abstain: 12
    },
    totalVotes: 191,
    userVote: 'for',
    quorum: 100,
    minVotes: 50
  },
  {
    id: '2',
    title: 'Implement New Security Protocol',
    description: 'Proposal to implement a new multi-signature security protocol for community treasury management to enhance security and transparency.',
    author: {
      id: '3',
      username: 'BlockchainDev',
      avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '0',
      name: 'MegaETH',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-26T14:00:00Z',
    endDate: '2024-06-03T14:00:00Z',
    status: 'active',
    votes: {
      for: 89,
      against: 15,
      abstain: 8
    },
    totalVotes: 112,
    userVote: null,
    quorum: 100,
    minVotes: 50
  },
  // Tribe 1 Proposals
  {
    id: '3',
    title: 'Launch DeFi Education Program',
    description: 'Proposal to allocate funds for a comprehensive DeFi education program including courses, workshops, and certification programs.',
    author: {
      id: '4',
      username: 'DeFiExpert',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '1',
      name: 'DeFi Masters',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-27T09:00:00Z',
    endDate: '2024-06-04T09:00:00Z',
    status: 'active',
    votes: {
      for: 234,
      against: 18,
      abstain: 7
    },
    totalVotes: 259,
    userVote: 'for',
    quorum: 100,
    minVotes: 50
  },
  {
    id: '4',
    title: 'Partnership with Major DeFi Protocol',
    description: 'Proposal to establish a strategic partnership with a major DeFi protocol to provide exclusive benefits to our community members.',
    author: {
      id: '5',
      username: 'YieldFarmer',
      avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x1234567890123456789012345678901234567890'
    },
    community: {
      id: '1',
      name: 'DeFi Masters',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-28T16:00:00Z',
    endDate: '2024-06-05T16:00:00Z',
    status: 'active',
    votes: {
      for: 167,
      against: 45,
      abstain: 12
    },
    totalVotes: 224,
    userVote: null,
    quorum: 100,
    minVotes: 50
  },
  // Tribe 2 Proposals
  {
    id: '5',
    title: 'Gaming Tournament Prize Pool Increase',
    description: 'Proposal to increase the monthly gaming tournament prize pool from 1000 XDC to 2000 XDC to attract more participants and increase engagement.',
    author: {
      id: '6',
      username: 'GameDev',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x9876543210987654321098765432109876543210'
    },
    community: {
      id: '2',
      name: 'Gaming Guild',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-29T12:00:00Z',
    endDate: '2024-06-06T12:00:00Z',
    status: 'active',
    votes: {
      for: 289,
      against: 23,
      abstain: 8
    },
    totalVotes: 320,
    userVote: 'for',
    quorum: 100,
    minVotes: 50
  },
  {
    id: '6',
    title: 'NFT Marketplace Integration',
    description: 'Proposal to integrate an NFT marketplace into our gaming platform to allow players to trade in-game assets and collectibles.',
    author: {
      id: '7',
      username: 'GamerPro',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      address: '0x9876543210987654321098765432109876543210'
    },
    community: {
      id: '2',
      name: 'Gaming Guild',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    createdAt: '2024-05-30T18:00:00Z',
    endDate: '2024-06-07T18:00:00Z',
    status: 'active',
    votes: {
      for: 198,
      against: 34,
      abstain: 15
    },
    totalVotes: 247,
    userVote: null,
    quorum: 100,
    minVotes: 50
  }
];

// Demo User Ticket Balances
export const demoUserTicketBalances: Record<number, number> = {
  1: 2, // User has 2 tickets for event 1
  2: 0, // User has 0 tickets for event 2
  3: 1, // User has 1 ticket for event 3
  4: 0, // User has 0 tickets for event 4
  5: 1, // User has 1 ticket for event 5
  6: 0  // User has 0 tickets for event 6
};

// Flag to easily enable/disable demo data
export const USE_DEMO_DATA = true;

// Function to get demo data based on flag
export const getDemoData = () => {
  if (!USE_DEMO_DATA) {
    return {
      events: [],
      posts: [],
      polls: [],
      proposals: [],
      userTicketBalances: {}
    };
  }

  return {
    events: demoEvents,
    posts: demoPosts,
    polls: demoPolls,
    proposals: demoProposals,
    userTicketBalances: demoUserTicketBalances
  };
};

// Function to easily disable demo data
export const disableDemoData = () => {
  // This function can be called to disable demo data
  // In a real implementation, you might want to set USE_DEMO_DATA = false
  console.log('Demo data disabled');
};

// Function to easily enable/disable demo data
export const toggleDemoData = (enable: boolean) => {
  // To disable demo data, call: toggleDemoData(false)
  // To enable demo data, call: toggleDemoData(true)
  console.log(`Demo data ${enable ? 'enabled' : 'disabled'}`);
  // In a real app, you would update the USE_DEMO_DATA flag here
  // For now, just log the action
}; 