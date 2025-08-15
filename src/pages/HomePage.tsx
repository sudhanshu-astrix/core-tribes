import { useState, useEffect } from 'react';
import { Search, TrendingUp, Filter, Users, Globe, Loader2, ChevronDown, ChevronUp, Calendar, FileText, Vote, BookOpen } from 'lucide-react';
import { TrendingCommunities } from '../components/home/TrendingCommunities';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { tribeContractService } from '../services/TribeContract';
import { TribeDetails } from '../services/TribeContract';
import { Avatar } from '../components/ui/Avatar';
import { formatCompactNumber } from '../lib/utils';
import { eventTicketsService, EventDetails } from '../services/EventTicketsService';
import { EventCard } from '../components/cards/EventCard';
import { postMinterService, Post } from '../services/PostMinterService';
import { PostCard } from '../components/cards/PostCard';
import { votingService, ProposalWithId } from '../services/VotingService';
import { ProposalCard } from '../components/cards/ProposalCard';
import { PollCard } from '../components/cards/PollCard';
import { QuizCard } from '../components/cards/QuizCard';
import { contentManagerService, PollDetails, QuizDetails } from '../services/ContentManager';
import { useWalletStore } from '../store/walletStore';

// Import new components and types
import { Games } from '../components/home/Games';

type FeedTab = 'for-you' | 'discover' | 'trending' | 'games';

interface ParsedMetadata {
  description: string;
  logo: string;
  banner: string;
  category: string;
  guidelines: string;
  tags: string[];
}

interface TribeWithParsedMetadata extends TribeDetails {
  parsedMetadata: ParsedMetadata;
}

// Helper function to determine active tab from pathname
const getActiveTabFromPathname = (pathname: string): FeedTab => {
  if (pathname.startsWith('/home/discover')) return 'discover';
  if (pathname.startsWith('/home/trending')) return 'trending';
  if (pathname.startsWith('/home/games')) return 'games';
  // Default to 'for-you' for /, /home/for-you, or any other /home/ path not matched above
  return 'for-you';
};

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

export function HomePage() {
  const location = useLocation();
  const activeTab = getActiveTabFromPathname(location.pathname);
  const { address } = useWalletStore();
  
  // Blockchain tribes state
  const [tribes, setTribes] = useState<TribeWithParsedMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTribes, setShowAllTribes] = useState(false);

  // User's tribe data (for "For You" tab)
  const [userTribeEvents, setUserTribeEvents] = useState<EventDetails[]>([]);
  const [userTribeProposals, setUserTribeProposals] = useState<ProposalWithId[]>([]);
  const [userTribePosts, setUserTribePosts] = useState<Post[]>([]);
  const [userTribePolls, setUserTribePolls] = useState<PollDetails[]>([]);
  const [userTribeQuizzes, setUserTribeQuizzes] = useState<QuizDetails[]>([]);
  const [userTribeLoading, setUserTribeLoading] = useState(true);

  // All data (for "Discover" tab)
  const [allEvents, setAllEvents] = useState<EventDetails[]>([]);
  const [allProposals, setAllProposals] = useState<ProposalWithId[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allPolls, setAllPolls] = useState<PollDetails[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<QuizDetails[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllProposals, setShowAllProposals] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllPolls, setShowAllPolls] = useState(false);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);

  // Load tribes from blockchain
  useEffect(() => {
    const loadTribes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await tribeContractService.initialize();
        
        const nextTribeId = await tribeContractService.getNextTribeId();
        console.log('Total tribes:', nextTribeId);
        
        const allTribes = await tribeContractService.getAllTribes();
        console.log('All tribes from blockchain:', allTribes);
        
        const processedTribes: TribeWithParsedMetadata[] = [];
        
        for (const tribe of allTribes) {
          if (tribe && tribe.metadata) {
            try {
              const parsedMetadata = parseMetadata(tribe.metadata);
              processedTribes.push({
                ...tribe,
                parsedMetadata
              });
            } catch (error) {
              console.warn(`Failed to parse metadata for tribe ${tribe.name}:`, error);
            }
          }
        }
        
        const sortedTribes = processedTribes.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
        
        console.log(`Successfully processed ${sortedTribes.length} tribes with valid metadata`);
        setTribes(sortedTribes);
        
      } catch (err) {
        console.error('Failed to load tribes:', err);
        setError('Failed to load communities from blockchain');
      } finally {
        setLoading(false);
      }
    };

    loadTribes();
  }, []);

  // Load user's tribe data (for "For You" tab)
  useEffect(() => {
    const loadUserTribeData = async () => {
      if (!address) {
        setUserTribeLoading(false);
        return;
      }

      try {
        setUserTribeLoading(true);
        
        await tribeContractService.initialize();
        await eventTicketsService.initialize();
        await votingService.initialize();
        await postMinterService.initialize();
        
        const allTribes = await tribeContractService.getAllTribes();
        const userTribeEventsList: EventDetails[] = [];
        const userTribeProposalsList: ProposalWithId[] = [];
        const userTribePostsList: Post[] = [];
        const userTribePollsList: PollDetails[] = [];
        const userTribeQuizzesList: QuizDetails[] = [];
        
        // Check which tribes the user is a member of or owns
        for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
          try {
            const isMember = await tribeContractService.isMember(tribeId, address);
            const tribeAdmin = await tribeContractService.getTribeAdmin(tribeId);
            const isOwner = tribeAdmin.toLowerCase() === address.toLowerCase();
            
            if (isMember || isOwner) {
              console.log(`User is part of tribe ${tribeId}, loading data...`);
              
              // Load events for this tribe
              try {
                const tribeEventIds = await eventTicketsService.getEventsByTribe(tribeId);
                const tribeEvents = await Promise.all(
                  tribeEventIds.map(async (eventId) => {
                    try {
                      return await eventTicketsService.getEventDetails(eventId);
                    } catch (error) {
                      console.warn(`Failed to get details for event ${eventId}:`, error);
                      return null;
                    }
                  })
                );
                const validEvents = tribeEvents.filter(event => event !== null) as EventDetails[];
                userTribeEventsList.push(...validEvents);
              } catch (error) {
                console.warn(`Failed to load events for tribe ${tribeId}:`, error);
              }
              
              // Load proposals for this tribe
              try {
                const tribeProposals = await votingService.getProposalsWithDetails(tribeId);
                userTribeProposalsList.push(...tribeProposals);
              } catch (error) {
                console.warn(`Failed to load proposals for tribe ${tribeId}:`, error);
              }
              
              // Load posts for this tribe
              try {
                const { posts: tribePosts } = await postMinterService.getPostsByTribe(tribeId, 0, 10);
                userTribePostsList.push(...tribePosts);
              } catch (error) {
                console.warn(`Failed to load posts for tribe ${tribeId}:`, error);
              }
              
              // Load polls for this tribe
              try {
                await contentManagerService.initialize();
                const tribePolls = await contentManagerService.getTribePollDetails(tribeId);
                userTribePollsList.push(...tribePolls);
              } catch (error) {
                console.warn(`Failed to load polls for tribe ${tribeId}:`, error);
              }
              
              // Load quizzes for this tribe
              try {
                const tribeQuizzes = await contentManagerService.getTribeQuizDetails(tribeId);
                userTribeQuizzesList.push(...tribeQuizzes);
              } catch (error) {
                console.warn(`Failed to load quizzes for tribe ${tribeId}:`, error);
              }
            }
          } catch (error) {
            console.warn(`Failed to check membership for tribe ${tribeId}:`, error);
          }
        }
        
        // Sort by date (newest first)
        userTribeEventsList.sort((a, b) => 
          new Date(b.metadata.startTime).getTime() - new Date(a.metadata.startTime).getTime()
        );
        userTribeProposalsList.sort((a, b) => 
          new Date(b.startTime * 1000).getTime() - new Date(a.startTime * 1000).getTime()
        );
        userTribePostsList.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        userTribePollsList.sort((a, b) => 
          new Date(b.endTime * 1000).getTime() - new Date(a.endTime * 1000).getTime()
        );
        userTribeQuizzesList.sort((a, b) => 
          new Date(b.endTime * 1000).getTime() - new Date(a.endTime * 1000).getTime()
        );
        
        setUserTribeEvents(userTribeEventsList);
        setUserTribeProposals(userTribeProposalsList);
        setUserTribePosts(userTribePostsList);
        setUserTribePolls(userTribePollsList);
        setUserTribeQuizzes(userTribeQuizzesList);
        
      } catch (error) {
        console.error('Failed to load user tribe data:', error);
      } finally {
        setUserTribeLoading(false);
      }
    };

    loadUserTribeData();
  }, [address]);

  // Load all data (for "Discover" tab)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setDiscoverLoading(true);
        
        await eventTicketsService.initialize();
        await votingService.initialize();
        await postMinterService.initialize();
        await tribeContractService.initialize();
        await contentManagerService.initialize();
        
        // Load all events
        const allEventIds = await eventTicketsService.getEventsByStatus(true);
        const allEventsList = await Promise.all(
          allEventIds.map(async (eventId) => {
            try {
              return await eventTicketsService.getEventDetails(eventId);
            } catch (error) {
              console.warn(`Failed to get details for event ${eventId}:`, error);
              return null;
            }
          })
        );
        const validEvents = allEventsList.filter(event => event !== null) as EventDetails[];
        validEvents.sort((a, b) => 
          new Date(b.metadata.startTime).getTime() - new Date(a.metadata.startTime).getTime()
        );
        setAllEvents(validEvents);
        
        // Load all proposals
        const allTribes = await tribeContractService.getAllTribes();
        const allProposalsList: ProposalWithId[] = [];
        for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
          try {
            const tribeProposals = await votingService.getProposalsWithDetails(tribeId);
            allProposalsList.push(...tribeProposals);
          } catch (error) {
            console.warn(`Failed to load proposals for tribe ${tribeId}:`, error);
          }
        }
        allProposalsList.sort((a, b) => 
          new Date(b.startTime * 1000).getTime() - new Date(a.startTime * 1000).getTime()
        );
        setAllProposals(allProposalsList);
        
        // Load all posts
        const allPostsList: Post[] = [];
        for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
          try {
            const { posts: tribePosts } = await postMinterService.getPostsByTribe(tribeId, 0, 5);
            allPostsList.push(...tribePosts);
          } catch (error) {
            console.warn(`Failed to load posts for tribe ${tribeId}:`, error);
          }
        }
        allPostsList.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllPosts(allPostsList);
        
        // Load all polls
        const allPollsList: PollDetails[] = [];
        for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
          try {
            const tribePolls = await contentManagerService.getTribePollDetails(tribeId);
            allPollsList.push(...tribePolls);
          } catch (error) {
            console.warn(`Failed to load polls for tribe ${tribeId}:`, error);
          }
        }
        allPollsList.sort((a, b) => 
          new Date(b.endTime * 1000).getTime() - new Date(a.endTime * 1000).getTime()
        );
        setAllPolls(allPollsList);
        
        // Load all quizzes
        const allQuizzesList: QuizDetails[] = [];
        for (let tribeId = 0; tribeId < allTribes.length; tribeId++) {
          try {
            const tribeQuizzes = await contentManagerService.getTribeQuizDetails(tribeId);
            allQuizzesList.push(...tribeQuizzes);
          } catch (error) {
            console.warn(`Failed to load quizzes for tribe ${tribeId}:`, error);
          }
        }
        allQuizzesList.sort((a, b) => 
          new Date(b.endTime * 1000).getTime() - new Date(a.endTime * 1000).getTime()
        );
        setAllQuizzes(allQuizzesList);
        
      } catch (error) {
        console.error('Failed to load all data:', error);
      } finally {
        setDiscoverLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Get tribes to display (3 or all based on showAllTribes state)
  const displayTribes = showAllTribes ? tribes : tribes.slice(0, 3);
  const hasMoreTribes = tribes.length > 3;

  return (
    <PageTransition>
      <div className="h-[90vh] overflow-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, communities, and more..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FAFAFA] dark:bg-[#1A1A1A] border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary focus:outline-none focus:ring-2 focus:ring-neonBlue/50"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {/* Feed Tabs */}
            <div className="border-b border-lightCard/30 dark:border-darkCard/30 mb-6">
              <div className="flex space-x-1">
                {[
                  { id: 'for-you', label: 'For You' },
                  { id: 'discover', label: 'Discover' },
                  { id: 'trending', label: 'Trending' },
                  { id: 'games', label: 'Games' },
                ].map((tab) => (
                  <Link
                    key={tab.id}
                    to={`/home/${tab.id}`}
                    className={`px-6 py-3 relative ${
                      activeTab === tab.id
                        ? 'text-primary dark:text-gray-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary dark:bg-gray-300 rounded-t-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">All Posts</Button>
                  <Button variant="outline" size="sm">Proposals</Button>
                  <Button variant="outline" size="sm">Events</Button>
                  <Button variant="outline" size="sm">AMAs</Button>
                </div>
              </div>
            )}

            {/* Feed Content */}
            <div className="space-y-4">
              {activeTab === 'for-you' && (
                <>
                  {/* User's Tribe Proposals */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          Your Tribe Proposals
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Proposals from communities you're part of
                        </p>
                      </div>
                    </div>
                    
                    {userTribeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading proposals...</p>
                      </div>
                    ) : userTribeProposals.length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No proposals yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Proposals from your communities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllProposals ? userTribeProposals : userTribeProposals.slice(0, 3)).map((proposal) => (
                          <ProposalCard
                            key={proposal.proposalId}
                            proposal={proposal}
                            onProposalUpdated={() => {}}
                            isOwner={false}
                          />
                        ))}
                        
                        {userTribeProposals.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllProposals(!showAllProposals)}
                              className="flex items-center gap-2"
                            >
                              {showAllProposals ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({userTribeProposals.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User's Tribe Events */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          Your Tribe Events
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Events from communities you're part of
                        </p>
                      </div>
                    </div>
                    
                    {userTribeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
                      </div>
                    ) : userTribeEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No events yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Events from your communities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllEvents ? userTribeEvents : userTribeEvents.slice(0, 3)).map((event) => (
                          <EventCard
                            key={event.eventId}
                            event={event}
                            onViewDetails={(eventId) => window.location.href = `/events/${eventId}`}
                            onPurchaseTickets={(eventId) => window.location.href = `/events/${eventId}`}
                            onRequestTickets={(eventId) => window.location.href = `/events/${eventId}`}
                            showTribeName={true}
                          />
                        ))}
                        
                        {userTribeEvents.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllEvents(!showAllEvents)}
                              className="flex items-center gap-2"
                            >
                              {showAllEvents ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({userTribeEvents.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User's Tribe Posts */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          Your Tribe Posts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Posts from communities you're part of
                        </p>
                      </div>
                    </div>
                    
                    {userTribeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
                      </div>
                    ) : userTribePosts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No posts yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Posts from your communities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllPosts ? userTribePosts : userTribePosts.slice(0, 5)).map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            showTribeName={true}
                          />
                        ))}
                        
                        {userTribePosts.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllPosts(!showAllPosts)}
                              className="flex items-center gap-2"
                            >
                              {showAllPosts ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({userTribePosts.length - 5} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User's Tribe Polls */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          Your Tribe Polls
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Polls from communities you're part of
                        </p>
                      </div>
                    </div>
                    
                    {userTribeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <p className="text-gray-600 dark:text-gray-400">Loading polls...</p>
                      </div>
                    ) : userTribePolls.length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No polls yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Polls from your communities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllPolls ? userTribePolls : userTribePolls.slice(0, 3)).map((poll) => (
                          <PollCard
                            key={poll.postId}
                            poll={poll}
                            tribeId={poll.tribeId || 0}
                            onPollUpdated={() => {}}
                            onPollDeleted={() => {}}
                            isOwner={false}
                            isMember={true} // User is a member since these are from their tribes
                          />
                        ))}
                        
                        {userTribePolls.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllPolls(!showAllPolls)}
                              className="flex items-center gap-2"
                            >
                              {showAllPolls ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({userTribePolls.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User's Tribe Quizzes */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          Your Tribe Quizzes
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Quizzes from communities you're part of
                        </p>
                      </div>
                    </div>
                    
                    {userTribeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                        <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                      </div>
                    ) : userTribeQuizzes.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No quizzes yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Quizzes from your communities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllQuizzes ? userTribeQuizzes : userTribeQuizzes.slice(0, 3)).map((quiz) => (
                          <QuizCard
                            key={quiz.postId}
                            quiz={quiz}
                            tribeId={quiz.tribeId || 0}
                            onQuizUpdated={() => {}}
                            onQuizDeleted={() => {}}
                            isOwner={false}
                            isMember={true} // User is a member since these are from their tribes
                          />
                        ))}
                        
                        {userTribeQuizzes.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllQuizzes(!showAllQuizzes)}
                              className="flex items-center gap-2"
                            >
                              {showAllQuizzes ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({userTribeQuizzes.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'discover' && (
                <div className="space-y-6">
                  {/* All Proposals */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          All Proposals
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Discover proposals from all communities
                        </p>
                      </div>
                    </div>
                    
                    {discoverLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading proposals...</p>
                      </div>
                    ) : allProposals.length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No proposals yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Proposals will appear here once communities create them
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllProposals ? allProposals : allProposals.slice(0, 5)).map((proposal) => (
                          <ProposalCard
                            key={proposal.proposalId}
                            proposal={proposal}
                            onProposalUpdated={() => {}}
                            isOwner={false}
                          />
                        ))}
                        
                        {allProposals.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllProposals(!showAllProposals)}
                              className="flex items-center gap-2"
                            >
                              {showAllProposals ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({allProposals.length - 5} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* All Events */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          All Events
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Discover events from all communities
                        </p>
                      </div>
                      <Link to="/events">
                        <Button variant="outline" size="sm">
                          View All Events
                        </Button>
                      </Link>
                    </div>
                    
                    {discoverLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
                      </div>
                    ) : allEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No events yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Events will appear here once communities create them
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllEvents ? allEvents : allEvents.slice(0, 3)).map((event) => (
                          <EventCard
                            key={event.eventId}
                            event={event}
                            onViewDetails={(eventId) => window.location.href = `/events/${eventId}`}
                            onPurchaseTickets={(eventId) => window.location.href = `/events/${eventId}`}
                            onRequestTickets={(eventId) => window.location.href = `/events/${eventId}`}
                            showTribeName={true}
                          />
                        ))}
                        
                        {allEvents.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllEvents(!showAllEvents)}
                              className="flex items-center gap-2"
                            >
                              {showAllEvents ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({allEvents.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* All Posts */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          All Posts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Discover posts from all communities
                        </p>
                      </div>
                    </div>
                    
                    {discoverLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#BBF10A]" />
                        <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
                      </div>
                    ) : allPosts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No posts yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Posts will appear here once communities create them
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllPosts ? allPosts : allPosts.slice(0, 5)).map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            showTribeName={true}
                          />
                        ))}
                        
                        {allPosts.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllPosts(!showAllPosts)}
                              className="flex items-center gap-2"
                            >
                              {showAllPosts ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({allPosts.length - 5} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* All Polls */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          All Polls
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Discover polls from all communities
                        </p>
                      </div>
                    </div>
                    
                    {discoverLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <p className="text-gray-600 dark:text-gray-400">Loading polls...</p>
                      </div>
                    ) : allPolls.length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No polls yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Polls will appear here once communities create them
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllPolls ? allPolls : allPolls.slice(0, 3)).map((poll) => (
                          <PollCard
                            key={poll.postId}
                            poll={poll}
                            tribeId={poll.tribeId || 0}
                            onPollUpdated={() => {}}
                            onPollDeleted={() => {}}
                            isOwner={false}
                            isMember={false} // User may not be a member of all tribes
                          />
                        ))}
                        
                        {allPolls.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllPolls(!showAllPolls)}
                              className="flex items-center gap-2"
                            >
                              {showAllPolls ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({allPolls.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* All Quizzes */}
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                          All Quizzes
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Discover quizzes from all communities
                        </p>
                      </div>
                    </div>
                    
                    {discoverLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                        <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                      </div>
                    ) : allQuizzes.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                          No quizzes yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Quizzes will appear here once communities create them
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showAllQuizzes ? allQuizzes : allQuizzes.slice(0, 3)).map((quiz) => (
                          <QuizCard
                            key={quiz.postId}
                            quiz={quiz}
                            tribeId={quiz.tribeId || 0}
                            onQuizUpdated={() => {}}
                            onQuizDeleted={() => {}}
                            isOwner={false}
                            isMember={false} // User may not be a member of all tribes
                          />
                        ))}
                        
                        {allQuizzes.length > 3 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowAllQuizzes(!showAllQuizzes)}
                              className="flex items-center gap-2"
                            >
                              {showAllQuizzes ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show More ({allQuizzes.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trending' && (
                <div className="space-y-4">
                  <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary dark:text-gray-300" />
                      <span className="text-lg font-semibold text-black dark:text-white">Trending Content</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Trending content will be displayed here based on engagement metrics.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'games' && <Games />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Communities from Blockchain */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-black dark:text-white">Trending Communities</h2>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  // Loading state
                  <div className="p-2 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#BBF10A] mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading communities from blockchain...
                    </p>
                  </div>
                ) : error ? (
                  // Error state
                  <div className="p-2 text-center">
                    <Globe className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-black dark:text-white mb-1">
                      Failed to Load
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : tribes.length === 0 ? (
                  // Empty state
                  <div className="p-2 text-center">
                    <Globe className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-black dark:text-white mb-1">
                      No Communities Yet
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Communities will appear here once they're created
                    </p>
                    <Link
                      to="/communities/create"
                      className="inline-flex items-center gap-2 text-xs text-primary dark:text-gray-300 hover:underline"
                    >
                      <Users className="h-3 w-3" />
                      Create First Community
                    </Link>
                  </div>
                ) : (
                  // Communities list
                  <div className="divide-y divide-lightCard/30 dark:divide-darkCard/30">
                    {displayTribes.map((tribe, ind) => (
                      <Link
                        key={tribe.name}
                        to={`/community/${ind}`}
                        className="flex items-center justify-between p-4 hover:bg-lightCardHover dark:hover:bg-darkCardHover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={tribe.parsedMetadata.logo}
                            alt={tribe.name?.charAt(0)?.toUpperCase() || 'T'}
                            size="sm"
                          />
                          <div>
                            <span className="font-medium text-black dark:text-white">
                              {tribe.name || 'Unnamed Community'}
                            </span>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {formatCompactNumber(tribe.memberCount || 0)} members
                            </div>
                          </div>
                        </div>
                        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                    ))}
                    
                    {/* Show More/Less Button */}
                    {hasMoreTribes && (
                      <div className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 dark:text-gray-300 dark:hover:text-gray-400"
                          onClick={() => setShowAllTribes(!showAllTribes)}
                        >
                          {showAllTribes ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show More ({tribes.length - 3} more)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-2xl p-5 border border-lightCard/30 dark:border-darkCard/30">
              <h3 className="font-semibold text-black dark:text-white mb-3">Welcome to Tribes!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Explore vibrant communities, have a say in how they're run, and keep track of your digital memberships and collectibles—all in one spot.
              </p>
              <Link to="/learn-more">
                <div className="text-xs text-primary dark:text-gray-300 hover:underline">
                  New to this? Learn how it works →
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}