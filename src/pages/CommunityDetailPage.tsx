import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Calendar, MessageSquare, BarChart3, Settings, Shield, Coins, Tag, Globe, Lock, Loader2, Plus, MoreHorizontal, ExternalLink, Heart, Share2, Bookmark, UserCheck, UserX, Clock, Edit, Save, X, CalendarDays, FileText, MapPin, Users as UsersIcon, DollarSign, Trash2, Vote, BookOpen } from 'lucide-react';
import { ethers } from 'ethers';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { tribeContractService, JoinType, MemberStatusEnum } from '../services/TribeContract';
import { TribeDetails } from '../services/TribeContract';
import { eventTicketsService, EventDetails as NewEventDetails } from '../services/EventTicketsService';
import { useWalletStore } from '../store/walletStore';
import { formatEther } from 'ethers';
import { eventContractService, EventWithMetadata } from '../services/EventContract';
import { EventCard } from '../components/cards/EventCard';
import { PostCreateForm } from '../components/community/PostCreateForm';
import { PostCard } from '../components/cards/PostCard';
import { postMinterService, Post } from '../services/PostMinterService';
import { votingService, ProposalWithId } from '../services/VotingService';
import { ProposalCard } from '../components/cards/ProposalCard';
import { ProposalCreateForm } from '../components/community/ProposalCreateForm';
import { PollCard } from '../components/cards/PollCard';
import { QuizCard } from '../components/cards/QuizCard';
import { PollCreateForm } from '../components/community/PollCreateForm';
import { QuizCreateForm } from '../components/community/QuizCreateForm';
import { contentManagerService, PollDetails, QuizDetails } from '../services/ContentManager';

interface ParsedMetadata {
  description: string;
  logo: string;
  banner: string;
  category: string;
  guidelines: string;
  tags: string[];
}

export function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { address } = useWalletStore();
  const [tribeDetails, setTribeDetails] = useState<TribeDetails | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberStatus, setMemberStatus] = useState<number>(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [events, setEvents] = useState<EventWithMetadata[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [userTicketBalances, setUserTicketBalances] = useState<Record<number, number>>({});
  const [memberStats, setMemberStats] = useState<{
    activeCount: number;
    pendingCount: number;
    bannedCount: number;
    totalProcessed: number;
  } | null>(null);
  const [pendingMembers, setPendingMembers] = useState<string[]>([]);
  const [bannedMembers, setBannedMembers] = useState<string[]>([]);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);

  const [processingMember, setProcessingMember] = useState<string | null>(null);
  const [canJoinInfo, setCanJoinInfo] = useState<{ canJoin: boolean; reason: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState<ParsedMetadata | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Event management state
  const [newEvents, setNewEvents] = useState<NewEventDetails[]>([]);
  const [newEventsLoading, setNewEventsLoading] = useState(true);

  // Post management state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Proposal management state
  const [proposals, setProposals] = useState<ProposalWithId[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  // Poll and Quiz management state
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDetails[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  // Parse metadata function
  const parseMetadata = (metadata: string): ParsedMetadata => {
    try {
      let parsed;
      
      if (typeof metadata === 'object' && metadata !== null) {
        parsed = metadata;
      } else if (typeof metadata === 'string') {
        parsed = JSON.parse(metadata);
      } else {
        throw new Error('Invalid metadata format');
      }
      
      return {
        description: parsed.description || parsed.desc || parsed.summary || 'No description available',
        logo: parsed.logo || parsed.image || parsed.avatar || 'https://via.placeholder.com/150x150?text=Tribe',
        banner: parsed.banner || parsed.cover || parsed.background || '',
        category: parsed.category || parsed.type || parsed.group || 'General',
        guidelines: parsed.guidelines || parsed.rules || parsed.terms || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : 
              Array.isArray(parsed.categories) ? parsed.categories : 
              parsed.keywords ? parsed.keywords.split(',').map((tag: string) => tag.trim()) : []
      };
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return {
        description: 'No description available',
        logo: 'https://via.placeholder.com/150x150?text=Tribe',
        banner: '',
        category: 'General',
        guidelines: '',
        tags: []
      };
    }
  };

  // Handle member approval
  const handleApproveMember = async (memberAddress: string) => {
    if (!address || !communityId) return;

    try {
      setProcessingMember(memberAddress);
      await tribeContractService.approveMember(parseInt(communityId), memberAddress);
      alert('Member approved successfully!');
      
      // Refresh member data
      await loadMemberData();
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert('Failed to approve member. Please try again.');
    } finally {
      setProcessingMember(null);
    }
  };

  // Handle member rejection
  const handleRejectMember = async (memberAddress: string) => {
    if (!address || !communityId) return;

    try {
      setProcessingMember(memberAddress);
      await tribeContractService.rejectMember(parseInt(communityId), memberAddress);
      alert('Member rejected successfully!');
      
      // Refresh member data
      await loadMemberData();
    } catch (error) {
      console.error('Failed to reject member:', error);
      alert('Failed to reject member. Please try again.');
    } finally {
      setProcessingMember(null);
    }
  };

  // Handle member ban
  const handleBanMember = async (memberAddress: string) => {
    if (!address || !communityId) return;

    if (!confirm('Are you sure you want to ban this member? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingMember(memberAddress);
      await tribeContractService.banMember(parseInt(communityId), memberAddress);
      alert('Member banned successfully!');
      
      // Refresh member data
      await loadMemberData();
    } catch (error) {
      console.error('Failed to ban member:', error);
      alert('Failed to ban member. Please try again.');
    } finally {
      setProcessingMember(null);
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditingMetadata(null);
    } else {
      // Start editing
      setIsEditing(true);
      setEditingMetadata(parsedMetadata ? { ...parsedMetadata } : null);
    }
  };

  // Handle metadata update
  const handleUpdateMetadata = async () => {
    if (!communityId || !editingMetadata) return;

    try {
      setIsUpdating(true);
      
      // Create new metadata JSON
      const newMetadata = JSON.stringify({
        description: editingMetadata.description,
        logo: editingMetadata.logo,
        banner: editingMetadata.banner,
        category: editingMetadata.category,
        guidelines: editingMetadata.guidelines,
        tags: editingMetadata.tags
      });

      // Update tribe on blockchain
      await tribeContractService.updateTribe(parseInt(communityId), newMetadata, []);
      
      // Update local state
      setParsedMetadata(editingMetadata);
      setIsEditing(false);
      setEditingMetadata(null);
      
      alert('Community updated successfully!');
    } catch (error) {
      console.error('Failed to update community:', error);
      alert('Failed to update community. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle leave community (placeholder - no direct leave function in contract)
  const handleLeaveCommunity = async () => {
    if (!address || !communityId) return;

    if (!confirm('Are you sure you want to leave this community? You will need to contact an admin to be removed.')) {
      return;
    }

    alert('Please contact a community admin to be removed from the community. Direct leave functionality is not available.');
  };

  // Load member data for admins
  const loadMemberData = async () => {
    if (!communityId || !isOwner) return;

    try {
      const tribeId = parseInt(communityId);
      
      // Get member statistics
      const stats = await tribeContractService.getTribeMemberStats(tribeId);
      setMemberStats(stats);
      
      // Get pending members
      const pending = await tribeContractService.getPendingMembers(tribeId);
      setPendingMembers(pending);
      
      // Get banned members
      const banned = await tribeContractService.getBannedMembers(tribeId);
      setBannedMembers(banned);
      
      // Get active members
      const active = await tribeContractService.getTribeMembers(tribeId);
      setActiveMembers(active);
    } catch (error) {
      console.error('Failed to load member data:', error);
    }
  };



  // Load tribe details
  useEffect(() => {
    const loadTribeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!communityId) {
          setError('Community ID is required');
          return;
        }

        const tribeId = parseInt(communityId);
        if (isNaN(tribeId)) {
          setError('Invalid community ID');
          return;
        }

        // Initialize tribe contract service
        console.log('🔄 Initializing tribe contract service...');
        await tribeContractService.initialize();
        console.log('✅ Tribe contract service initialized');
        
        // Check if tribe exists
        console.log('🔍 Checking if tribe exists...');
        const exists = await tribeContractService.getTribeExists(tribeId);
        console.log('✅ Tribe exists check result:', exists);
        
        if (!exists) {
          setError('Community not found');
          return;
        }

        // Get tribe details
        console.log('📋 Getting tribe details...');
        const details = await tribeContractService.getTribeDetails(tribeId);
        console.log('✅ Tribe details:', details);
        
        // Parse metadata
        const metadata = parseMetadata(details.metadata || '');
        console.log('Parsed metadata:', metadata);
        
        // Get member count
        const memberCount = await tribeContractService.getMemberCount(tribeId);
        
        // Check if current user is member and owner
        let userIsMember = false;
        let userMemberStatus = 0;
        let userIsOwner = false;
        let canJoinData = null;
        
        if (address) {
          try {
            userIsMember = await tribeContractService.isMember(tribeId, address);
            userMemberStatus = await tribeContractService.getMemberStatus(tribeId, address);
            const admin = await tribeContractService.getTribeAdmin(tribeId);
            userIsOwner = admin?.toLowerCase() === address.toLowerCase();
            
            // Check if user can join
            canJoinData = await tribeContractService.canUserJoinTribe(tribeId, address);
          } catch (error) {
            console.warn('Failed to check membership status:', error);
          }
        }

        setTribeDetails({
          ...details,
          memberCount: Number(memberCount) || 0
        });
        setParsedMetadata(metadata);
        setIsMember(userIsMember);
        setMemberStatus(userMemberStatus);
        setIsOwner(userIsOwner);
        setCanJoinInfo(canJoinData);
        
      } catch (err) {
        console.error('Failed to load tribe details:', err);
        setError('Failed to load community details');
      } finally {
        setLoading(false);
      }
    };

    loadTribeDetails();
  }, [communityId, address]);

  // Load member data when user becomes owner
  useEffect(() => {
    if (isOwner && communityId) {
      loadMemberData();
    }
  }, [isOwner, communityId]);

  // Load events for this community
  useEffect(() => {
    const loadEvents = async () => {
      if (!communityId) return;

      try {
        setEventsLoading(true);
        await eventContractService.initialize();
        const tribeEvents = await eventContractService.getEventsByTribeId(parseInt(communityId));
        setEvents(tribeEvents);

        // Load user ticket balances if wallet is connected
        if (address) {
          const balances: Record<number, number> = {};
          for (const event of tribeEvents) {
            const balance = await eventContractService.getTicketBalance(address, event.eventId);
            balances[event.eventId] = balance;
          }
          setUserTicketBalances(balances);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, [communityId, address]);

  // Load new events for this community
  const loadNewEvents = async () => {
    if (!communityId) return;

    try {
      setNewEventsLoading(true);
      await eventTicketsService.initialize();
      const eventIds = await eventTicketsService.getEventsByTribe(parseInt(communityId));
      const eventsWithDetails = await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            return await eventTicketsService.getEventDetails(eventId);
          } catch (error) {
            console.warn(`Failed to get details for event ${eventId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null events and events without proper metadata
      const validEvents = eventsWithDetails.filter(event => {
        if (!event) return false;
        
        // Check if event has required metadata fields
        const metadata = event.metadata;
        if (!metadata || !metadata.startTime || !metadata.endTime) {
          console.warn(`Event ${event.eventId} missing required metadata fields`);
          return false;
        }
        
        return true;
      }) as NewEventDetails[];
      
      setNewEvents(validEvents);
    } catch (error) {
      console.error('Failed to load new events:', error);
    } finally {
      setNewEventsLoading(false);
    }
  };

  useEffect(() => {
    loadNewEvents();
  }, [communityId]);

  // Refresh events function
  const refreshEvents = () => {
    loadNewEvents();
  };

  // Load posts for this community
  const loadPosts = async () => {
    if (!communityId) return;

    try {
      setPostsLoading(true);
      await postMinterService.initialize();
      const { posts: tribePosts } = await postMinterService.getPostsByTribe(parseInt(communityId), 0, 20);
      setPosts(tribePosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [communityId]);

  // Handle post creation
  const handlePostCreated = (postId: number) => {
    setShowCreatePost(false);
    // Refresh posts
    loadPosts();
  };

  // Handle post deletion
  const handlePostDeleted = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Load proposals for this community
  const loadProposals = async () => {
    if (!communityId) return;

    try {
      setProposalsLoading(true);
      await votingService.initialize();
      const tribeProposals = await votingService.getProposalsWithDetails(parseInt(communityId));
      setProposals(tribeProposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setProposalsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    loadPolls();
    loadQuizzes();
  }, [communityId]);

  // Handle proposal creation
  const handleProposalCreated = (proposalId: number) => {
    setShowCreateProposal(false);
    // Refresh proposals
    loadProposals();
  };

  // Handle proposal updates
  const handleProposalUpdated = () => {
    // Refresh proposals
    loadProposals();
  };

  // Load polls for this community
  const loadPolls = async () => {
    if (!communityId) return;

    try {
      setPollsLoading(true);
      await contentManagerService.initialize();
      const pollsList = await contentManagerService.getTribePollDetails(parseInt(communityId));
      setPolls(pollsList);
    } catch (error) {
      console.error('Failed to load polls:', error);
      setPolls([]);
    } finally {
      setPollsLoading(false);
    }
  };

  // Load quizzes for this community
  const loadQuizzes = async () => {
    if (!communityId) return;

    try {
      setQuizzesLoading(true);
      await contentManagerService.initialize();
      const quizzesList = await contentManagerService.getTribeQuizDetails(parseInt(communityId));
      setQuizzes(quizzesList);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  // Handle poll creation
  const handlePollCreated = (pollId: number) => {
    setShowCreatePoll(false);
    // Refresh polls
    loadPolls();
  };

  // Handle poll updates
  const handlePollUpdated = () => {
    // Refresh polls
    loadPolls();
  };

  // Handle poll deletion
  const handlePollDeleted = (pollId: number) => {
    setPolls(prev => prev.filter(poll => poll.postId !== pollId));
  };

  // Handle quiz creation
  const handleQuizCreated = (quizId: number) => {
    setShowCreateQuiz(false);
    // Refresh quizzes
    loadQuizzes();
  };

  // Handle quiz updates
  const handleQuizUpdated = () => {
    // Refresh quizzes
    loadQuizzes();
  };

  // Handle quiz deletion
  const handleQuizDeleted = (quizId: number) => {
    setQuizzes(prev => prev.filter(quiz => quiz.postId !== quizId));
  };

  // Handle event deletion
  const handleEventDeleted = (eventId: number) => {
    setNewEvents(prev => prev.filter(event => event.eventId !== eventId));
  };

  // Handle event cancellation
  const handleCancelEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventTicketsService.initialize();
      await eventTicketsService.cancelEvent(eventId);
      alert('Event cancelled successfully!');
      handleEventDeleted(eventId);
    } catch (error) {
      console.error('Failed to cancel event:', error);
      alert('Failed to cancel event. Please try again.');
    }
  };

  // Handle ticket purchase for new events
  const handlePurchaseTickets = async (eventId: number, amount: number = 1) => {
    if (!address) {
      alert('Please connect your wallet to purchase tickets');
      return;
    }

    try {
      const event = newEvents.find(e => e.eventId === eventId);
      if (!event) return;

      if (event.isPrivate) {
        await eventTicketsService.requestTickets(eventId, amount);
        alert('Ticket request submitted! Please wait for organizer approval.');
      } else {
        await eventTicketsService.purchaseTickets(eventId, amount);
        alert('Tickets purchased successfully!');
      }
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      alert('Failed to purchase tickets. Please try again.');
    }
  };

  // Handle ticket purchase
  const handleTicketPurchase = async (eventId: number, amount: number) => {
    if (!address) {
      alert('Please connect your wallet to purchase tickets');
      return;
    }

    try {
      const event = events.find(e => e.eventId === eventId);
      if (!event) return;

      if (event.isPrivate) {
        await eventContractService.requestTickets(eventId, amount);
        alert('Ticket request submitted! Please wait for organizer approval.');
      } else {
        await eventContractService.purchaseTickets(eventId, amount);
        alert('Tickets purchased successfully!');
      }

      // Refresh ticket balances
      const newBalance = await eventContractService.getTicketBalance(address, eventId);
      setUserTicketBalances(prev => ({
        ...prev,
        [eventId]: newBalance
      }));
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      alert('Failed to purchase tickets. Please try again.');
    }
  };

  // Get join type display info
  const getJoinTypeInfo = () => {
    if (!tribeDetails) return { icon: Globe, label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' };
    
    switch (tribeDetails.joinType) {
      case JoinType.Public:
        return { icon: Globe, label: 'Public', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
      case JoinType.InviteOnly:
        return { icon: Lock, label: 'Invite Only', color: 'text-[#BBF10A]', bgColor: 'bg-[#BBF10A]/20 dark:bg-[#BBF10A]/20' };
      case JoinType.Whitelist:
        return { icon: Crown, label: 'Whitelist', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
      case JoinType.NFTGated:
        return { icon: Lock, label: 'NFT Gated', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
      case JoinType.MultiNFT:
        return { icon: Lock, label: 'Multi NFT', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
      case JoinType.AnyNFT:
        return { icon: Lock, label: 'Any NFT', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
      case JoinType.InviteCode:
        return { icon: Lock, label: 'Invite Code', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
      default:
        return { icon: Globe, label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' };
    }
  };

  // Handle join actions
  const handleJoin = async () => {
    if (!address) {
      alert('Please connect your wallet to join this community');
      return;
    }

    if (!tribeDetails || !communityId) {
      alert('Community details not available');
      return;
    }

    try {
      setIsJoining(true);
      
      if (tribeDetails.joinType === JoinType.Public) {
        // Direct join for public tribes
        await tribeContractService.joinTribe(parseInt(communityId));
      } else {
        // Request to join for private tribes
        await tribeContractService.requestToJoinTribe(parseInt(communityId));
      }
      
      // Refresh membership status
      const member = await tribeContractService.isMember(parseInt(communityId), address);
      const status = await tribeContractService.getMemberStatus(parseInt(communityId), address);
      
      setIsMember(member);
      setMemberStatus(Number(status));
      
      alert(tribeDetails.joinType === JoinType.Public ? 'Successfully joined community!' : 'Join request submitted!');
    } catch (error) {
      console.error('Failed to join community:', error);
      alert('Failed to join community. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#BBF10A]" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-[#BBF10A]/20 rounded-full"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">
              Loading community details...
            </p>
                  </div>
      </div>


    </div>
  );
}

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          </div>
          <Link to="/communities">
            <Button className="group transition-all duration-200 hover:scale-105">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!tribeDetails || !parsedMetadata) {
    return (
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Community details not available
            </p>
          </div>
          <Link to="/communities">
            <Button className="group transition-all duration-200 hover:scale-105">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const joinTypeInfo = getJoinTypeInfo();
  const JoinTypeIcon = joinTypeInfo.icon;

  return (
    <div className="max-w-screen-xl mx-auto px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/communities" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black mb-6 group transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Communities
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-black font-bold text-3xl">
                  {tribeDetails.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-3">
                {tribeDetails.name || 'Unnamed Community'}
              </h1>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>{parsedMetadata.category || 'General'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{tribeDetails.memberCount || 0} members</span>
                </span>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${joinTypeInfo.bgColor} ${joinTypeInfo.color}`}>
                  <JoinTypeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{joinTypeInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            
            {isOwner && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#BBF10A]/20 dark:bg-gray-700 text-black dark:text-[#BBF10A] rounded-full border border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Admin</span>
              </div>
            )}
            {isMember && !isOwner && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium">Member</span>
              </div>
            )}
            {memberStatus === MemberStatusEnum.PENDING && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#BBF10A]/20 dark:bg-gray-700 text-black dark:text-[#BBF10A] rounded-full border border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Pending Approval</span>
              </div>
            )}
            {!isMember && memberStatus === MemberStatusEnum.NONE && canJoinInfo?.canJoin && (
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-[#2A2A2A]"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {tribeDetails.joinType === JoinType.Public ? 'Join Community' : 'Request to Join'}
              </Button>
            )}
            {!isMember && memberStatus === MemberStatusEnum.NONE && !canJoinInfo?.canJoin && canJoinInfo?.reason && (
              <div className="text-sm text-red-600 dark:text-red-400 max-w-xs">
                Cannot join: {canJoinInfo.reason}
              </div>
            )}
            {/* Admin can also join as member even if they're the owner */}
            {isOwner && !isMember && canJoinInfo?.canJoin && (
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                variant="outline"
                className="border-[#BBF10A] text-[#BBF10A] hover:bg-[#BBF10A]/10"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Join as Member
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Feeds Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Header */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  Community Feed
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Stay updated with the latest posts and discussions
                </p>
              </div>
              {(isMember || isOwner) && (
                <Button 
                  className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                  onClick={() => setShowCreatePost(!showCreatePost)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showCreatePost ? 'Cancel Post' : 'Create Post'}
                </Button>
              )}
            </div>
            
            {/* Create Post Form */}
            {showCreatePost && (isMember || isOwner) && (
              <div className="mb-6">
                <PostCreateForm
                  tribeId={parseInt(communityId!)}
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowCreatePost(false)}
                />
              </div>
            )}
            
            {/* Posts List */}
            {postsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to share something with the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    showTribeName={false}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Proposals Section */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  Community Proposals
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Vote on community governance proposals
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={loadProposals}
                  disabled={proposalsLoading}
                >
                  <Loader2 className={`w-4 h-4 mr-2 ${proposalsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {(isOwner || isMember) && (
                  <Button 
                    className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                    onClick={() => setShowCreateProposal(!showCreateProposal)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showCreateProposal ? 'Cancel Proposal' : 'Create Proposal'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Create Proposal Form */}
            {showCreateProposal && (isOwner || isMember) && (
              <div className="mb-6">
                <ProposalCreateForm
                  tribeId={parseInt(communityId!)}
                  onProposalCreated={handleProposalCreated}
                  onCancel={() => setShowCreateProposal(false)}
                />
              </div>
            )}
            
            {proposalsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                <p className="text-gray-600 dark:text-gray-400">Loading proposals...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No proposals yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to create a proposal for the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposalId}
                    proposal={proposal}
                    onProposalUpdated={handleProposalUpdated}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Polls Section */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  Community Polls
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Vote on community polls and surveys
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={loadPolls}
                  disabled={pollsLoading}
                >
                  <Loader2 className={`w-4 h-4 mr-2 ${pollsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {(isOwner || isMember) && (
                  <Button 
                    className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                    onClick={() => setShowCreatePoll(!showCreatePoll)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showCreatePoll ? 'Cancel Poll' : 'Create Poll'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Create Poll Form */}
            {showCreatePoll && (isOwner || isMember) && (
              <div className="mb-6">
                <PollCreateForm
                  tribeId={parseInt(communityId!)}
                  onPollCreated={handlePollCreated}
                  onCancel={() => setShowCreatePoll(false)}
                />
              </div>
            )}
            
            {pollsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-400">Loading polls...</p>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No polls yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to create a poll for the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => (
                  <PollCard
                    key={poll.postId}
                    poll={poll}
                    tribeId={parseInt(communityId!)}
                    onPollUpdated={handlePollUpdated}
                    onPollDeleted={handlePollDeleted}
                    isOwner={isOwner || poll.creator.toLowerCase() === address?.toLowerCase()}
                    isMember={isMember}
                    showExploreButton={false}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Quizzes Section */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  Community Quizzes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Test your knowledge with community quizzes
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={loadQuizzes}
                  disabled={quizzesLoading}
                >
                  <Loader2 className={`w-4 h-4 mr-2 ${quizzesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {(isOwner || isMember) && (
                  <Button 
                    className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                    onClick={() => setShowCreateQuiz(!showCreateQuiz)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showCreateQuiz ? 'Cancel Quiz' : 'Create Quiz'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Create Quiz Form */}
            {showCreateQuiz && (isOwner || isMember) && (
              <div className="mb-6">
                <QuizCreateForm
                  tribeId={parseInt(communityId!)}
                  onQuizCreated={handleQuizCreated}
                  onCancel={() => setShowCreateQuiz(false)}
                />
              </div>
            )}
            
            {quizzesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No quizzes yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to create a quiz for the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.postId}
                    quiz={quiz}
                    tribeId={parseInt(communityId!)}
                    onQuizUpdated={handleQuizUpdated}
                    onQuizDeleted={handleQuizDeleted}
                    isOwner={isOwner || quiz.creator.toLowerCase() === address?.toLowerCase()}
                    isMember={isMember}
                    showExploreButton={false}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Events Section */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                  Community Events
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join community events and activities
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={refreshEvents}
                  disabled={newEventsLoading}
                >
                  <Loader2 className={`w-4 h-4 mr-2 ${newEventsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {isOwner && (
                  <Button 
                    className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                    onClick={() => navigate(`/community/${communityId}/event/create`)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            </div>
            
            {newEventsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
              </div>
            ) : newEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  No events scheduled
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for upcoming community events!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newEvents.map((event) => (
                  <div key={event.eventId} className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Event Header */}
                    <div className="relative p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {event.metadata.title || 'Untitled Event'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {event.metadata.description || 'No description available'}
                          </p>
                        </div>
                        
                        {/* Event Options Menu */}
                        {isOwner && (
                          <div className="relative ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => handleCancelEvent(event.eventId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Event Status Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {event.active ? 'Active' : 'Cancelled'}
                        </div>
                        {event.isPrivate && (
                          <div className="px-3 py-1 bg-gray-700 text-white dark:bg-[#BBF10A]/30 dark:text-[#BBF10A] rounded-full text-xs font-medium">
                            Private
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="px-6 pb-4 space-y-3">
                      {/* Date and Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.metadata.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(event.metadata.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })} - {new Date(event.metadata.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      
                      {/* Location */}
                      {event.metadata.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.metadata.location}</span>
                        </div>
                      )}
                      
                      {/* Capacity */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <UsersIcon className="h-4 w-4" />
                        <span>{Number(event.ticketsSold)}/{Number(event.maxTickets)} tickets sold</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        <span className={`font-medium ${
                          event.price === '0' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {event.price === '0' ? 'Free' : `${parseFloat(event.price) / 1e18} XDC`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="px-6 pb-6">
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                          onClick={() => navigate(`/events/${event.eventId}`)}
                        >
                          View Details
                        </Button>
                        {event.active && event.ticketsSold < event.maxTickets && (
                          <Button
                            variant="outline"
                            onClick={() => handlePurchaseTickets(event.eventId)}
                            disabled={!address}
                          >
                            {event.price === '0' ? 'Get Free Ticket' : 'Buy Ticket'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Info */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                About Community
              </h3>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="flex items-center gap-2"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
            
            {isEditing && editingMetadata ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingMetadata.description}
                    onChange={(e) => setEditingMetadata({...editingMetadata, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingMetadata.category}
                    onChange={(e) => setEditingMetadata({...editingMetadata, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Guidelines
                  </label>
                  <textarea
                    value={editingMetadata.guidelines}
                    onChange={(e) => setEditingMetadata({...editingMetadata, guidelines: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingMetadata.tags.join(', ')}
                    onChange={(e) => setEditingMetadata({...editingMetadata, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateMetadata}
                    disabled={isUpdating}
                    className="bg-[#BBF10A] text-black hover:bg-[#BBF10A]/90 rounded-xl"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditToggle}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {parsedMetadata.description}
                </p>
                
                {parsedMetadata.guidelines && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-black dark:text-white mb-2">Guidelines</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parsedMetadata.guidelines}
                    </p>
                  </div>
                )}
                
                {parsedMetadata.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-black dark:text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedMetadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#BBF10A]/20 text-black rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Member Statistics */}
          {memberStats && (
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                Member Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">Active</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">{memberStats.activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#BBF10A]" />
                    <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">{memberStats.pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600 dark:text-gray-400">Banned</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">{memberStats.bannedCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-lightCard/50 dark:border-darkCard/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                  </div>
                  <span className="font-bold text-black dark:text-white">{memberStats.totalProcessed}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Member Management for Admins */}
          {isOwner && (
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Member Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage community members and their permissions
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Pending Members */}
                {pendingMembers.length > 0 && (
                  <div className="bg-[#BBF10A]/10 dark:bg-[#BBF10A]/10 rounded-lg p-6 border border-[#BBF10A]/30 dark:border-[#BBF10A]/30">
                    <h4 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#BBF10A]" />
                      Pending Approval ({pendingMembers.length})
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {pendingMembers.map((memberAddress) => (
                        <div key={memberAddress} className="bg-white dark:bg-gray-800 rounded-lg border border-[#BBF10A]/30 dark:border-[#BBF10A]/30 shadow-sm hover:shadow-md transition-all duration-200 p-4 min-w-[200px] flex-shrink-0">
                          <div className="flex flex-col items-center text-center space-y-3">
                                                          <div className="w-10 h-10 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {memberAddress.slice(2, 4).toUpperCase()}
                              </span>
                            </div>
                            <div className="w-full">
                              <div className="font-medium text-black dark:text-white text-sm mb-2">
                                {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#BBF10A]/20 dark:bg-[#BBF10A]/30 text-[#BBF10A] dark:text-[#BBF10A] rounded-full text-xs font-medium mb-3">
                                <Clock className="w-3 h-3" />
                                Pending
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveMember(memberAddress)}
                                  disabled={processingMember === memberAddress}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                                >
                                  {processingMember === memberAddress ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectMember(memberAddress)}
                                  disabled={processingMember === memberAddress}
                                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                                >
                                  {processingMember === memberAddress ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Members */}
                {activeMembers.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      Active Members ({activeMembers.length})
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {activeMembers.map((memberAddress) => (
                        <div key={memberAddress} className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-200 p-4 min-w-[200px] flex">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {memberAddress.slice(2, 4).toUpperCase()}
                              </span>
                            </div>
                            <div className="w-full">
                              <div className="font-medium text-black dark:text-white text-sm mb-2">
                                {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium mb-3">
                                <UserCheck className="w-3 h-3" />
                                Active
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBanMember(memberAddress)}
                                disabled={processingMember === memberAddress}
                                className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 hover:border-red-400 text-xs"
                              >
                                {processingMember === memberAddress ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3 mr-1" />
                                    Ban Member
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Banned Members */}
                {bannedMembers.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                      <UserX className="w-5 h-5 text-red-600" />
                      Banned Members ({bannedMembers.length})
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {bannedMembers.map((memberAddress) => (
                        <div key={memberAddress} className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-200 p-4 min-w-[200px] flex-shrink-0">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {memberAddress.slice(2, 4).toUpperCase()}
                              </span>
                            </div>
                            <div className="w-full">
                              <div className="font-medium text-black dark:text-white text-sm mb-2">
                                {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                <UserX className="w-3 h-3" />
                                Banned
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {pendingMembers.length === 0 && activeMembers.length === 0 && bannedMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
                    <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                      No Members Yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      When members join your community, they will appear here for management.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Community Actions */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-r from-lightCard to-lightCard/80 dark:from-darkCard dark:to-darkCard/80">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">
              Community Actions
            </h3>
            <div className="space-y-3">
              {(isMember || isOwner) && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowCreatePost(!showCreatePost)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showCreatePost ? 'Cancel Post' : 'Create Post'}
                </Button>
              )}
              {(isMember || isOwner) && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowCreateProposal(!showCreateProposal)}
                >
                  <Vote className="w-4 h-4 mr-2" />
                  {showCreateProposal ? 'Cancel Proposal' : 'Create Proposal'}
                </Button>
              )}
              {isOwner && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/community/${communityId}/event/create`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
              {isOwner && (
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Community Settings
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Community
              </Button>
              {/* Admin can join as member if not already a member */}
              {isOwner && !isMember && canJoinInfo?.canJoin && (
                <Button 
                  className="w-full justify-start text-[#BBF10A] hover:text-[#BBF10A]/80 hover:bg-[#BBF10A]/10" 
                  variant="outline"
                  onClick={handleJoin}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserCheck className="w-4 h-4 mr-2" />
                  )}
                  Join as Member
                </Button>
              )}
              {isMember && !isOwner && (
                <Button 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                  variant="outline"
                  onClick={handleLeaveCommunity}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Leave Community
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
} 