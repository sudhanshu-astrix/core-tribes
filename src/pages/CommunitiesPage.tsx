import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2, Crown, Users, UserCheck, UserX, Clock, Shield, FileText, Calendar } from 'lucide-react';
import { UserTribeCard } from '../components/cards/UserTribeCard';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { tribeContractService } from '../services/TribeContract';
import { TribeDetails, MemberStatusEnum } from '../services/TribeContract';
import { postMinterService, Post } from '../services/PostMinterService';
import { PostCreateForm } from '../components/community/PostCreateForm';
import { PostCard } from '../components/cards/PostCard';
import { useWalletStore } from '../store/walletStore';
import { eventTicketsService, EventDetails } from '../services/EventTicketsService';
import { EventCard } from '../components/cards/EventCard';
import { EventCreateForm } from '../components/community/EventCreateForm';

interface UserTribeWithId extends TribeDetails {
  tribeId: number;
}

interface TribeWithParsedMetadata extends UserTribeWithId {
  parsedMetadata: {
    description: string;
    logo: string;
    banner: string;
    category: string;
    guidelines: string;
    tags: string[];
  };
  memberStats?: {
    activeCount: number;
    pendingCount: number;
    bannedCount: number;
    totalProcessed: number;
  };
  pendingMembers?: string[];
  isAdmin?: boolean;
}

export function CommunitiesPage() {
  const { address } = useWalletStore();
  const [userTribes, setUserTribes] = useState<UserTribeWithId[]>([]);
  const [tribesWithDetails, setTribesWithDetails] = useState<TribeWithParsedMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPendingMembers, setShowPendingMembers] = useState<number | null>(null);
  const [processingMember, setProcessingMember] = useState<string | null>(null);
  
  // Post-related state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState<number | null>(null);
  const [selectedTribeForPosts, setSelectedTribeForPosts] = useState<number | null>(null);
  
  // Event-related state
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState<number | null>(null);
  const [selectedTribeForEvents, setSelectedTribeForEvents] = useState<number | null>(null);

  // Parse metadata to get additional tribe info
  const parseMetadata = (metadata: string) => {
    console.log('Raw metadata from blockchain:', metadata);
    console.log('Metadata type:', typeof metadata);
    
    try {
      // Handle different metadata formats
      let parsed;
      
      // If metadata is already an object
      if (typeof metadata === 'object' && metadata !== null) {
        parsed = metadata;
      } else if (typeof metadata === 'string') {
        // Try to parse as JSON
        parsed = JSON.parse(metadata);
      } else {
        throw new Error('Invalid metadata format');
      }
      
      console.log('Parsed metadata object:', parsed);
      
      // Handle different possible metadata structures
      const result = {
        description: parsed.description || parsed.desc || parsed.summary || 'No description available',
        logo: parsed.logo || parsed.image || parsed.avatar || 'https://via.placeholder.com/150x150?text=Tribe',
        banner: parsed.banner || parsed.cover || parsed.background || '',
        category: parsed.category || parsed.type || parsed.group || 'General',
        guidelines: parsed.guidelines || parsed.rules || parsed.terms || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : 
              Array.isArray(parsed.categories) ? parsed.categories : 
              parsed.keywords ? parsed.keywords.split(',').map((tag: string) => tag.trim()) : []
      };
      
      console.log('Processed metadata result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing metadata:', error);
      console.log('Falling back to default metadata');
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
  const handleApproveMember = async (tribeId: number, memberAddress: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setProcessingMember(memberAddress);
      await tribeContractService.approveMember(tribeId, memberAddress);
      alert('Member approved successfully!');
      
      // Refresh tribe data
      await loadUserTribes();
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert('Failed to approve member. Please try again.');
    } finally {
      setProcessingMember(null);
    }
  };

  // Handle member rejection
  const handleRejectMember = async (tribeId: number, memberAddress: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setProcessingMember(memberAddress);
      await tribeContractService.rejectMember(tribeId, memberAddress);
      alert('Member rejected successfully!');
      
      // Refresh tribe data
      await loadUserTribes();
    } catch (error) {
      console.error('Failed to reject member:', error);
      alert('Failed to reject member. Please try again.');
    } finally {
      setProcessingMember(null);
    }
  };

  // Process tribes and create tribesWithDetails
  useEffect(() => {
    const processedTribes: TribeWithParsedMetadata[] = [];
    
    for (const tribe of userTribes) {
      if (tribe && tribe.metadata) {
        try {
          const parsedMetadata = parseMetadata(tribe.metadata);
          processedTribes.push({
            ...tribe,
            parsedMetadata
          });
        } catch (error) {
          console.warn(`Failed to parse metadata for tribe ${tribe.tribeId}:`, error);
          // Skip this tribe if metadata parsing fails
        }
      } else {
        console.log(`Skipping tribe ${tribe?.tribeId} due to missing metadata:`, tribe);
      }
    }
    
    console.log(`Processed ${processedTribes.length} tribes with valid metadata out of ${userTribes.length} total tribes`);
    setTribesWithDetails(processedTribes);
  }, [userTribes]);

  // Load user-created tribes from blockchain
  const loadUserTribes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!address) {
        setError('Please connect your wallet to view your communities');
        setLoading(false);
        return;
      }

      console.log('Loading user tribes for address:', address);
      
      // Initialize tribe contract service
      await tribeContractService.initialize();
      
      // Get user's tribes with status using the new function
      const { tribeIds, statuses } = await tribeContractService.getUserTribesWithStatus(address);
      console.log('User tribe IDs with statuses:', tribeIds, statuses);
      
      // Get details for each tribe using getTribeDetails
      const tribesWithDetails: TribeWithParsedMetadata[] = [];
      
      for (let i = 0; i < tribeIds.length; i++) {
        const tribeId = tribeIds[i];
        const status = statuses[i];
        
        try {
          console.log(`Fetching details for tribe ${tribeId} with status ${status}...`);
          
          // Check if tribe exists
          const exists = await tribeContractService.getTribeExists(tribeId);
          if (!exists) {
            console.log(`Tribe ${tribeId} does not exist, skipping...`);
            continue;
          } 
          
          // Get tribe details using getTribeDetails
          const tribeDetails = await tribeContractService.getTribeDetails(tribeId);
          console.log(`Raw tribe details for ${tribeId}:`, tribeDetails);
          
          // Get member count using getMemberCount
          const memberCount = await tribeContractService.getMemberCount(tribeId);
          
          // Get member statistics
          const memberStats = await tribeContractService.getTribeMemberStats(tribeId);
          
          // Check if user is admin
          const admin = await tribeContractService.getTribeAdmin(tribeId);
          const isAdmin = admin?.toLowerCase() === address.toLowerCase();
          
          // Get pending members if user is admin
          let pendingMembers: string[] = [];
          if (isAdmin) {
            pendingMembers = await tribeContractService.getPendingMembers(tribeId);
          }
          
          // Create enhanced tribe details
          const enhancedTribe: TribeWithParsedMetadata = {
            ...tribeDetails,
            memberCount: Number(memberCount),
            tribeId: tribeId,
            memberStats,
            pendingMembers,
            isAdmin,
            parsedMetadata: parseMetadata(tribeDetails.metadata || '')
          };
          
          console.log(`Enhanced tribe for ${tribeId}:`, enhancedTribe);
          tribesWithDetails.push(enhancedTribe);
          console.log(`Successfully fetched tribe ${tribeId}: ${tribeDetails.name} with ${memberCount} members`);
        } catch (error) {
          console.warn(`Failed to get details for tribe ${tribeId}:`, error);
          // Continue with next tribe
        }
      }
      
      console.log(`Successfully fetched ${tribesWithDetails.length} user tribes`);
      console.log('Tribe details:', tribesWithDetails);
      setUserTribes(tribesWithDetails);
    } catch (err) {
      console.error('Failed to load user tribes:', err);
      setError('Failed to load your communities from blockchain');
    } finally {
      setLoading(false);
    }
  };

  // Load user tribes on component mount
  useEffect(() => {
    loadUserTribes();
  }, [address]);

  // Load posts for a specific tribe
  const loadTribePosts = async (tribeId: number) => {
    try {
      setPostsLoading(true);
      await postMinterService.initialize();
      const { posts: tribePosts } = await postMinterService.getPostsByTribe(tribeId, 0, 20);
      setPosts(tribePosts);
    } catch (error) {
      console.error('Failed to load tribe posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Load events for a specific tribe
  const loadTribeEvents = async (tribeId: number) => {
    try {
      setEventsLoading(true);
      await eventTicketsService.initialize();
      const eventIds = await eventTicketsService.getEventsByTribe(tribeId);
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
        console.log('Events with details:', eventsWithDetails);
        const validEvents = eventsWithDetails.filter(event => event !== null) as EventDetails[];
        setEvents(validEvents);
    } catch (error) {
      console.error('Failed to load tribe events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle post creation
  const handlePostCreated = (postId: number) => {
    setShowCreatePost(null);
    // Refresh posts if we're currently viewing posts for this tribe
    if (selectedTribeForPosts) {
      loadTribePosts(selectedTribeForPosts);
    }
  };

  // Handle post deletion
  const handlePostDeleted = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Handle event creation
  const handleEventCreated = (eventId: number) => {
    setShowCreateEvent(null);
    // Refresh events if we're currently viewing events for this tribe
    if (selectedTribeForEvents) {
      loadTribeEvents(selectedTribeForEvents);
    }
  };

  // Handle event deletion
  const handleEventDeleted = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.eventId !== eventId));
  };

  // Filter tribes based on search and category
  const filteredTribes = tribesWithDetails.filter(tribe => {
    console.log('Filtering tribe:', tribe.name, 'parsedMetadata:', tribe.parsedMetadata, 'searchQuery:', searchQuery, 'filterCategory:', filterCategory);
    
    // If no search query, show all tribes
    if (!searchQuery.trim()) {
      const matchesCategory = filterCategory === 'all' || tribe.parsedMetadata.category === filterCategory;
      console.log('No search query, category match:', matchesCategory);
      return matchesCategory;
    }
    
    const matchesSearch = (tribe.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.parsedMetadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.parsedMetadata.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tribe.parsedMetadata.category === filterCategory;
    
    console.log('Search match:', matchesSearch, 'Category match:', matchesCategory);
    return matchesSearch && matchesCategory;
  });

  console.log('User tribes:', userTribes.length, 'Tribes with details:', tribesWithDetails.length, 'Filtered tribes:', filteredTribes.length);

  // Get unique categories from tribes with details
  const categories = ['all', ...Array.from(new Set(tribesWithDetails.map(tribe => tribe.parsedMetadata.category)))];

  if (loading) {
    return (
      <div className="max-w-screen-xl h-[90vh] mx-auto px-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#BBF10A]" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading your communities from blockchain...
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
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="max-w-screen-xl h-[80vh] overflow-scroll mx-auto px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2 flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#BBF10A]" />
            My Communities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and interact with your created communities
          </p>
        </div>
        <div className="flex gap-3">
          {/* <Button
            variant="outline"
            onClick={loadUserTribes}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button> */}
          <Link to="/communities/create">
            <Button
              className="flex items-center gap-2"
              style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 6 }}
            >
              <Plus className="h-5 w-5" />
              Create Community
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search your communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[#FAFAFA] dark:bg-[#1A1A1A] border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#FAFAFA] dark:bg-[#1A1A1A] border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Communities Grid */}
      {filteredTribes.length === 0 ? (
        <div className="text-center py-16">
          {userTribes.length === 0 ? (
            <div>
              <Crown className="h-16 w-16 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                You haven't created any communities yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your first community and bring people together!
              </p>
              <Link to="/communities/create">
                <Button
                  style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 6 }}
                >
                  Create Your First Community
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <Search className="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                No communities match your search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredTribes.reverse().map((tribe) => (
            <div key={tribe.tribeId} className="bg-[#FAFAFA] dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <UserTribeCard
                tribe={tribe}
                tribeId={tribe.tribeId}
                parsedMetadata={tribe.parsedMetadata}
                className="mb-4"
              />

              {/* Pending Members Section for Admins */}
              {tribe.isAdmin && tribe.pendingMembers && tribe.pendingMembers.length > 0 && (
                <div className="border-t border-lightCard/50 dark:border-darkCard/50 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#BBF10A]" />
                      Pending Members ({tribe.pendingMembers.length})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPendingMembers(showPendingMembers === tribe.tribeId ? null : tribe.tribeId)}
                    >
                      {showPendingMembers === tribe.tribeId ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                  
                  {showPendingMembers === tribe.tribeId && (
                    <div className="space-y-2">
                      {tribe.pendingMembers.map((memberAddress) => (
                        <div key={memberAddress} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-full flex items-center justify-center">
                              <span className="text-black font-bold text-sm">
                                {memberAddress.slice(2, 4).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-black dark:text-white">
                                {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Waiting for approval
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveMember(tribe.tribeId, memberAddress)}
                              disabled={processingMember === memberAddress}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingMember === memberAddress ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectMember(tribe.tribeId, memberAddress)}
                              disabled={processingMember === memberAddress}
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              {processingMember === memberAddress ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Reject'
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}