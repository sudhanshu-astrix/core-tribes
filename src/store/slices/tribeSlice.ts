import { StateCreator } from 'zustand';
import { Community, Post, Proposal, CommunityMember } from '../../types';
import { mockCommunities } from '../../data/mockData';

export interface TribeSlice {
  // State
  communities: Community[];
  currentCommunity: Community | null;
  communityMembers: CommunityMember[];
  posts: Post[];
  proposals: Proposal[];
  polls: any[]; // TODO: Add Poll type to types/index.ts
  governance: any[]; // TODO: Add Governance type to types/index.ts
  
  // Community Actions
  setCommunities: (communities: Community[]) => void;
  addCommunity: (community: Community) => void;
  updateCommunity: (id: string, updates: Partial<Community>) => void;
  deleteCommunity: (id: string) => void;
  setCurrentCommunity: (community: Community | null) => void;
  
  // Community Members Actions
  setCommunityMembers: (members: CommunityMember[]) => void;
  addCommunityMember: (member: CommunityMember) => void;
  updateCommunityMember: (communityId: string, userId: string, updates: Partial<CommunityMember>) => void;
  removeCommunityMember: (communityId: string, userId: string) => void;
  
  // Posts Actions
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  
  // Proposals Actions
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  
  // Polls Actions
  setPolls: (polls: any[]) => void;
  addPoll: (poll: any) => void;
  updatePoll: (id: string, updates: any) => void;
  deletePoll: (id: string) => void;
  
  // Governance Actions
  setGovernance: (governance: any[]) => void;
  addGovernance: (governance: any) => void;
  updateGovernance: (id: string, updates: any) => void;
  deleteGovernance: (id: string) => void;
}

export const tribeSlice: StateCreator<TribeSlice> = (set, get) => ({
  // Initial state - start with empty arrays
  communities: [],
  currentCommunity: null,
  communityMembers: [],
  posts: [],
  proposals: [],
  polls: [],
  governance: [],
  
  // Community Actions
  setCommunities: (communities) => set({ communities }),
  
  addCommunity: (community) => set((state) => ({
    communities: [...state.communities, community]
  })),
  
  updateCommunity: (id, updates) => set((state) => ({
    communities: state.communities.map(community =>
      community.id === id ? { ...community, ...updates } : community
    )
  })),
  
  deleteCommunity: (id) => set((state) => ({
    communities: state.communities.filter(community => community.id !== id)
  })),
  
  setCurrentCommunity: (community) => set({ currentCommunity: community }),
  
  // Community Members Actions
  setCommunityMembers: (members) => set({ communityMembers: members }),
  
  addCommunityMember: (member) => set((state) => ({
    communityMembers: [...state.communityMembers, member]
  })),
  
  updateCommunityMember: (communityId, userId, updates) => set((state) => ({
    communityMembers: state.communityMembers.map(member =>
      member.communityId === communityId && member.userId === userId
        ? { ...member, ...updates }
        : member
    )
  })),
  
  removeCommunityMember: (communityId, userId) => set((state) => ({
    communityMembers: state.communityMembers.filter(member =>
      !(member.communityId === communityId && member.userId === userId)
    )
  })),
  
  // Posts Actions
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts]
  })),
  
  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map(post =>
      post.id === id ? { ...post, ...updates } : post
    )
  })),
  
  deletePost: (id) => set((state) => ({
    posts: state.posts.filter(post => post.id !== id)
  })),
  
  // Proposals Actions
  setProposals: (proposals) => set({ proposals }),
  
  addProposal: (proposal) => set((state) => ({
    proposals: [proposal, ...state.proposals]
  })),
  
  updateProposal: (id, updates) => set((state) => ({
    proposals: state.proposals.map(proposal =>
      proposal.id === id ? { ...proposal, ...updates } : proposal
    )
  })),
  
  deleteProposal: (id) => set((state) => ({
    proposals: state.proposals.filter(proposal => proposal.id !== id)
  })),
  
  // Polls Actions
  setPolls: (polls) => set({ polls }),
  
  addPoll: (poll) => set((state) => ({
    polls: [poll, ...state.polls]
  })),
  
  updatePoll: (id, updates) => set((state) => ({
    polls: state.polls.map(poll =>
      poll.id === id ? { ...poll, ...updates } : poll
    )
  })),
  
  deletePoll: (id) => set((state) => ({
    polls: state.polls.filter(poll => poll.id !== id)
  })),
  
  // Governance Actions
  setGovernance: (governance) => set({ governance }),
  
  addGovernance: (governance) => set((state) => ({
    governance: [governance, ...state.governance]
  })),
  
  updateGovernance: (id, updates) => set((state) => ({
    governance: state.governance.map(gov =>
      gov.id === id ? { ...gov, ...updates } : gov
    )
  })),
  
  deleteGovernance: (id) => set((state) => ({
    governance: state.governance.filter(gov => gov.id !== id)
  })),
}); 