import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Calendar, MessageSquare, BarChart3, Settings, Shield, Coins, Tag, Vote, FileText, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { tribeContractService } from '../../services/TribeContract';
import { TribeDetails } from '../../services/TribeContract';
import { useWalletStore } from '../../store/walletStore';
import { formatEther } from 'ethers';
import { EventCreateForm } from '../../components/community/EventCreateForm';
import { PostCreateForm } from '../../components/community/PostCreateForm';
import { PollCreateForm } from '../../components/community/PollCreateForm';
import { ProposalCreateForm } from '../../components/community/ProposalCreateForm';
import { EventCard } from '../../components/cards/EventCard';
import { PostCard } from '../../components/cards/PostCard';
import { PollCard } from '../../components/cards/PollCard';
import { ProposalCard } from '../../components/cards/ProposalCard';
import { getDemoData } from '../../data/demoData';

interface ParsedMetadata {
  description: string;
  logo: string;
  banner: string;
  category: string;
  guidelines: string;
  tags: string[];
}

type TabType = 'overview' | 'events' | 'posts' | 'polls' | 'governance';

export function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const { address } = useWalletStore();
  const [tribeDetails, setTribeDetails] = useState<TribeDetails | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberStatus, setMemberStatus] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showCreateForm, setShowCreateForm] = useState<string | null>(null);

  // Demo data
  const { events, posts, polls, proposals, userTicketBalances } = getDemoData();

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
        await tribeContractService.initialize();
        
        // Check if tribe exists
        const exists = await tribeContractService.getTribeExists(tribeId);
        if (!exists) {
          setError('Community not found');
          return;
        }

        // Get tribe details
        const details = await tribeContractService.getTribeDetails(tribeId);
        console.log('Tribe details:', details);
        
        // Parse metadata
        const metadata = parseMetadata(details.metadata);
        console.log('Parsed metadata:', metadata);
        
        // Get member count
        const memberCount = await tribeContractService.getMemberCount(tribeId);
        
        // Check if current user is member
        let userIsMember = false;
        let userMemberStatus = 0;
        if (address) {
          try {
            userIsMember = await tribeContractService.isMember(tribeId, address);
            userMemberStatus = await tribeContractService.getMemberStatus(tribeId, address);
          } catch (error) {
            console.warn('Failed to check membership status:', error);
          }
        }

        setTribeDetails({
          ...details,
          memberCount: Number(memberCount)
        });
        setParsedMetadata(metadata);
        setIsMember(userIsMember);
        setMemberStatus(userMemberStatus);
        
      } catch (err) {
        console.error('Failed to load tribe details:', err);
        setError('Failed to load community details');
      } finally {
        setLoading(false);
      }
    };

    loadTribeDetails();
  }, [communityId, address]);

  const handleVote = (pollId: string, optionId: string) => {
    console.log('Voting on poll:', pollId, 'option:', optionId);
    // In a real app, this would call the blockchain
  };

  const handleProposalVote = (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    console.log('Voting on proposal:', proposalId, 'vote:', vote);
    // In a real app, this would call the blockchain
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'polls', label: 'Polls', icon: BarChart3 },
    { id: 'governance', label: 'Governance', icon: Vote },
  ];

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF10A] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
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
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/communities">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Community details not available
          </p>
          <Link to="/communities">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {parsedMetadata.description || 'No description available for this community.'}
              </p>
            </Card>

            {/* Guidelines */}
            {parsedMetadata.guidelines && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Guidelines</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {parsedMetadata.guidelines}
                </p>
              </Card>
            )}

            {/* Tags */}
            {parsedMetadata.tags && parsedMetadata.tags.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {parsedMetadata.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-lightCard/50 dark:bg-darkCard/50 text-sm rounded-full text-gray-600 dark:text-gray-400 border border-lightCard/50 dark:border-darkCard/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Events</h2>
              {isMember && (
                <EventCreateForm />
              )}
            </div>
            
            {events.length > 0 ? (
              <div className="grid gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.eventId}
                    event={event}
                    userTicketBalance={userTicketBalances[event.eventId] || 0}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No Events Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Be the first to create an event for this community!
                </p>
                {isMember && <EventCreateForm />}
              </Card>
            )}
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Posts</h2>
              {isMember && (
                <PostCreateForm />
              )}
            </div>
            
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={(postId) => console.log('Like post:', postId)}
                    onComment={(postId) => console.log('Comment on post:', postId)}
                    onShare={(postId) => console.log('Share post:', postId)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No Posts Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Be the first to share something with the community!
                </p>
                {isMember && <PostCreateForm />}
              </Card>
            )}
          </div>
        );

      case 'polls':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Polls</h2>
              {isMember && (
                <PollCreateForm />
              )}
            </div>
            
            {polls.length > 0 ? (
              <div className="space-y-6">
                {polls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No Polls Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create a poll to get community feedback!
                </p>
                {isMember && <PollCreateForm />}
              </Card>
            )}
          </div>
        );

      case 'governance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Governance</h2>
              {isMember && (
                <ProposalCreateForm />
              )}
            </div>
            
            {proposals.length > 0 ? (
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onVote={handleProposalVote}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Vote className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No Proposals Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create a proposal to make changes to the community!
                </p>
                {isMember && <ProposalCreateForm />}
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/communities" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 flex items-center justify-center">
              <span className="text-black font-bold text-2xl">
                {tribeDetails.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                {tribeDetails.name || 'Unnamed Community'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {parsedMetadata.category || 'General'} • {tribeDetails.memberCount || 0} members
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isMember && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium">Member</span>
              </div>
            )}
            {tribeDetails.admin === address && (
                              <div className="flex items-center space-x-1 px-3 py-1 bg-[#BBF10A]/20 dark:bg-gray-700 text-black dark:text-[#BBF10A] rounded-full">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-lightCard dark:bg-darkCard rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#BBF10A] text-black shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Members</span>
                <span className="font-semibold text-black dark:text-white">
                  {tribeDetails.memberCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type</span>
                <span className="font-semibold text-black dark:text-white">
                  {tribeDetails.joinType === 0 ? 'Public' : 'Private'}
                </span>
              </div>
              {tribeDetails.entryFee && tribeDetails.entryFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Entry Fee</span>
                  <span className="font-semibold text-black dark:text-white flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    {formatEther(tribeDetails.entryFee)} ETH
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-semibold text-black dark:text-white">
                  {tribeDetails.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to={`/tribe/${communityId}/members`}>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  View Members
                </Button>
              </Link>
              {tribeDetails.admin === address && (
                <Link to={`/tribe/${communityId}/settings`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Community
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Join/Leave Button */}
          <Card className="p-6">
            {!isMember ? (
              <Button 
                className="w-full"
                style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 6 }}
              >
                <Users className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            ) : (
              <Button 
                className="w-full" 
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Leave Community
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 