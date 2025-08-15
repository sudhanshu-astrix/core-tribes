import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/store';
import { useWalletStore } from '../store/walletStore';
import { getProfileByAddress, getUserPointsByAddress } from '../services/BackendService';
import { getToken, removeToken, setToken } from '../utlils/utliFunctions';
import { profileContractService } from '../services/ProfileContract';
import { tribeContractService, TribeDetails } from '../services/TribeContract';
import { Avatar } from '../components/ui/Avatar';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProfileStats } from '../components/profile/ProfileStats';
import { PointsOverview } from '../components/profile/PointsOverview';
import { UpdateProfileForm } from '../components/profile/UpdateProfileForm';
import { TokenCard } from '../components/cards/TokenCard';
import { CommunityCard } from '../components/cards/CommunityCard';
import { mockCommunities } from '../data/mockData';
import { shortenAddress } from '../lib/utils';
import { cn } from '../lib/utils';
import { User } from '../types';
import { Github, Twitter, Globe, Linkedin, Instagram, Youtube, Award, Calendar, MessageSquare, Star, Users, Vote, TrendingUp, Trophy, Clock, Edit, Loader2, Crown, ExternalLink } from 'lucide-react';

interface ProfileData {
  username?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: [{[key: string]: string}] | {[key: string]: string}
}

interface ApiResponse {
  success: boolean;
  data: {
    user: ProfileData;
    token: string;
  };
}

interface ActivityType {
  id: string;
  name: string;
  description: string;
  pointsReward: number;
}

interface PointsLog {
  id: string;
  activityType: ActivityType;
  pointsEarned: number;
  metadata: any;
  createdAt: string;
}

interface PointsData {
  pointsLogs: PointsLog[];
  summary: {
    totalPointsEarned: number;
    activityTypeCounts: { [key: string]: number };
    totalActivities: number;
  };
}

interface UserCommunity {
  tribeId: number;
  details: TribeDetails;
  isOwner: boolean;
  memberStatus: number;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, disconnectWallet: disconnectUserWallet, setWalletModalOpen, updateUser } = useUserStore();
  const { disconnect: disconnectWallet, address, isConnected } = useWalletStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isCheckingContract, setIsCheckingContract] = useState(false);
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  
  // Parse metadata function
  const parseMetadata = (metadata: string): any => {
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

  // Get icon for activity type
  const getActivityIcon = (activityName: string) => {
    switch (activityName.toLowerCase()) {
      case 'profile creation':
      case 'profile update':
        return <Award className="h-4 w-4" />;
      case 'daily login':
        return <Calendar className="h-4 w-4" />;
      case 'post creation':
      case 'tribe post creation':
        return <MessageSquare className="h-4 w-4" />;
      case 'comment creation':
        return <MessageSquare className="h-4 w-4" />;
      case 'reaction':
        return <Star className="h-4 w-4" />;
      case 'tribe creation':
      case 'tribe update':
      case 'tribe join':
        return <Users className="h-4 w-4" />;
      case 'tribe event creation':
        return <Calendar className="h-4 w-4" />;
      case 'tribe poll creation':
      case 'poll engagement':
      case 'governance voting':
        return <Vote className="h-4 w-4" />;
      case 'tribe governance proposal':
        return <TrendingUp className="h-4 w-4" />;
      case 'event ticket purchase':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  // Get color for activity type
  const getActivityColor = (activityName: string) => {
    switch (activityName.toLowerCase()) {
      case 'profile creation':
      case 'profile update':
        return 'text-blue-500';
      case 'daily login':
        return 'text-green-500';
      case 'post creation':
      case 'tribe post creation':
        return 'text-purple-500';
      case 'comment creation':
        return 'text-indigo-500';
      case 'reaction':
        return 'text-[#BBF10A]';
      case 'tribe creation':
      case 'tribe update':
      case 'tribe join':
        return 'text-pink-500';
      case 'tribe event creation':
        return 'text-orange-500';
      case 'tribe poll creation':
      case 'poll engagement':
      case 'governance voting':
        return 'text-red-500';
      case 'tribe governance proposal':
        return 'text-emerald-500';
      case 'event ticket purchase':
        return 'text-cyan-500';
      default:
        return 'text-gray-500';
    }
  };

  // Fetch user communities
  const fetchUserCommunities = async () => {
    if (!address) return;

    try {
      setIsLoadingCommunities(true);
      
      // Initialize tribe contract service
      await tribeContractService.initialize();
      
      // Get user's joined tribes
      const joinedTribeIds = await tribeContractService.getUserTribes(address);
      
      // Get all tribes to check which ones the user created (is admin)
      const allTribes = await tribeContractService.getAllTribes();
      
      const communities: UserCommunity[] = [];
      
      // Process joined tribes
      for (const tribeId of joinedTribeIds) {
        try {
          const tribeDetails = await tribeContractService.getTribeDetails(tribeId);
          const memberStatus = await tribeContractService.getMemberStatus(tribeId, address);
          const isOwner = tribeDetails.admin.toLowerCase() === address.toLowerCase();
          
          communities.push({
            tribeId,
            details: tribeDetails,
            isOwner,
            memberStatus: Number(memberStatus)
          });
        } catch (error) {
          console.warn(`Failed to get details for tribe ${tribeId}:`, error);
        }
      }
      
      // Add created tribes that user might not have joined
      for (const tribe of allTribes) {
        const isOwner = tribe.admin.toLowerCase() === address.toLowerCase();
        if (isOwner && !communities.find(c => c.details.name === tribe.name)) {
          try {
            // Find the actual tribeId for this tribe by checking all tribes
            const nextTribeId = await tribeContractService.getNextTribeId();
            for (let i = 0; i < nextTribeId; i++) {
              try {
                const exists = await tribeContractService.getTribeExists(i);
                if (exists) {
                  const details = await tribeContractService.getTribeDetails(i);
                  if (details.admin.toLowerCase() === address.toLowerCase() && 
                      details.name === tribe.name) {
                    communities.push({
                      tribeId: i,
                      details,
                      isOwner: true,
                      memberStatus: 1 // Active member as owner
                    });
                    break;
                  }
                }
              } catch (error) {
                continue;
              }
            }
          } catch (error) {
            console.warn('Failed to find tribeId for created tribe:', error);
          }
        }
      }
      
      setUserCommunities(communities);
    } catch (error) {
      console.error('Error fetching user communities:', error);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const handleDisconnect = () => {
    // Disconnect from both wallet store and user store
    disconnectWallet();
    disconnectUserWallet();
    // Reset profile state
    setProfileData(null);
    setProfileExists(false);
    setPointsData(null);
    setUserCommunities([]);
  };

  const handleUpdateProfile = (updatedUser: any) => {
    // Convert socialLinks to array format if it's an object
    const userWithCorrectSocialLinks = {
      ...updatedUser,
      socialLinks: typeof updatedUser.socialLinks === 'object' && !Array.isArray(updatedUser.socialLinks) 
        ? [updatedUser.socialLinks] 
        : updatedUser.socialLinks || []
    };
    
    // Update user store
    updateUser(userWithCorrectSocialLinks as any);
    // Update local profile data
    setProfileData(userWithCorrectSocialLinks as ProfileData);
  };

  // Check Profile Contract and fetch profile data when wallet is connected
  useEffect(() => {
    const checkProfileAndFetch = async () => {
      // If we have cached user data and token, use it
      let authToken = getToken("authToken");
      if (authToken && user && typeof user === 'object' && 'id' in user) {
        console.log("Using cached user data:", user);
        setProfileExists(true);
        setProfileData(user as ProfileData);
        return;
      }

      if (isConnected && address) {
        setIsCheckingContract(true);
        try {
          // First, check if profile exists on the blockchain
          await profileContractService.initialize();
          const hasProfileOnChain = await profileContractService.hasProfile(address);
          
          console.log('Profile exists on chain:', hasProfileOnChain);
          
          if (hasProfileOnChain) {
            // Profile exists on chain, now fetch from API
            setIsLoading(true);
            try {
              const result = await getProfileByAddress(address) as ApiResponse;
              if (result && result.success) {
                // Store token in localStorage
                setToken('authToken', result.data.token);
                
                // Store user data in Redux
                const userData = {
                  ...user,
                  ...result.data.user,
                  walletAddress: address
                };
                updateUser(userData as any);
                
                // Update local state
                setProfileData(result.data.user as ProfileData);
                setProfileExists(true);
              } else {
                setProfileExists(false);
                setProfileData(null);
                updateUser({});
                removeToken("authToken");
              }
            } catch (error) {
              console.error('Error fetching profile from API:', error);
              setProfileExists(false);
              setProfileData(null);
              setPointsData(null); // Clear points data on API error
              updateUser({});
              removeToken("authToken");
            } finally {
              setIsLoading(false);
            }
          } else {
            // No profile on chain
            setProfileExists(false);
            setProfileData(null);
            setPointsData(null); // Clear points data when no profile exists
            updateUser({});
            removeToken("authToken");
          }
        } catch (error) {
          console.error('Error checking profile contract:', error);
          setProfileExists(false);
          setProfileData(null);
          setPointsData(null); // Clear points data on contract error
          updateUser({});
          removeToken("authToken");
        } finally {
          setIsCheckingContract(false);
        }
      }
    };

    checkProfileAndFetch();
  }, [isConnected, address]);

  // Check if user is a valid User object (not empty object)
  const isValidUser = user && typeof user === 'object' && 'id' in user;

  // Fetch points data only when profile exists
  useEffect(() => {
    const fetchPointsData = async () => {
      if (address && profileExists && isValidUser) {
        setIsLoadingPoints(true);
        try {
          const response = await getUserPointsByAddress(address);
          if (response && response.success) {
            setPointsData(response.data);
          }
        } catch (error) {
          console.error('Error fetching points data:', error);
        } finally {
          setIsLoadingPoints(false);
        }
      }
    };

    fetchPointsData();
  }, [address, profileExists, isValidUser]);

  // Fetch user communities when profile exists
  useEffect(() => {
    if (profileExists && address) {
      fetchUserCommunities();
    }
  }, [profileExists, address]);
  
  // Show loading state while checking contract
  if (isCheckingContract) {
    return (
      <div className="max-w-screen-xl h-[85vh] mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[#BBF10A] mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
            Checking Profile Status
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Verifying your profile on the blockchain...
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Wallet: {shortenAddress(address || '')}
          </div>
        </div>
      </div>
    );
  }
  
  // Show connect wallet message if not connected
  if (!isConnected || !address) {
    return (
      <div className="max-w-screen h-[85vh] mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
          Connect your wallet to view your profile
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          You need to connect a wallet to access your profile, tokens, and communities.
        </p>
        <Button
          variant="ghost"
          onClick={() => setWalletModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-screen-xl h-[85vh] mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[#BBF10A] mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
            Loading Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Fetching your profile data...
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Wallet: {shortenAddress(address || '')}
          </div>
        </div>
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="max-w-screen-xl h-[85vh] mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-lightCard dark:bg-darkCard rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-[#BBF10A]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
            Create Your Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            No profile found for your wallet address ({shortenAddress(address)}). 
            Create your profile on the blockchain to start your journey in Tribes.
          </p>
          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate('/create-profile')}
              className="w-full sm:w-auto"
            >
              Create Profile
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Switch Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have valid user data before showing profile (only check if profile exists)
  if (!isValidUser) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">
          Profile Data Error
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Unable to load profile data. Please try refreshing the page.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          Refresh Page
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar
              src={profileData?.avatar || (isValidUser && 'avatar' in user ? user.avatar : "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740")}
              alt={profileData?.username || (isValidUser && 'username' in user ? user.username : 'User')}
              size="lg"
              className="w-20 h-20 sm:w-24 sm:h-24"
            />
            
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-1">
                {profileData?.username || (isValidUser && 'username' in user ? user.username : 'User')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                {shortenAddress(isValidUser && 'walletAddress' in user ? user.walletAddress : address || '')}
              </p>
              
              {/* Bio */}
              <p className="text-sm sm:text-base text-black dark:text-white mb-4 max-w-md mx-auto sm:mx-0">
                {profileData?.bio}
              </p>

              {/* Social Links */}
              {profileData?.socialLinks && (
                <div className='flex flex-row items-center gap-2 sm:gap-3 justify-center py-2 my-2 sm:justify-start flex-wrap'>
                  {(() => {
                    // Handle both array format and object format
                    let socialLinks: {[key: string]: string} = {};
                    
                    if (Array.isArray(profileData.socialLinks)) {
                      // Convert array format to object format
                      profileData.socialLinks.forEach((link: any) => {
                        if (link && typeof link === 'object') {
                          Object.assign(socialLinks, link);
                        }
                      });
                    } else if (typeof profileData.socialLinks === 'object') {
                      socialLinks = profileData.socialLinks;
                    }
                    
                    return Object.entries(socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      
                      const getIcon = (platform: string) => {
                        switch (platform) {
                          case 'github':
                            return <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300" />;
                            break;
                          case 'twitter':
                            return <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />;
                            break;
                          case 'linkedin':
                            return <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />;
                            break;
                          case 'instagram':
                            return <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />;
                            break;
                          case 'youtube':
                            return <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors duration-300" />;
                            break;
                          case 'website':
                            return <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-500 transition-colors duration-300" />;
                            break;
                          default:
                            return <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300" />;
                        }
                      };

                      return (
                        <a 
                          key={platform}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#EFEFEF] dark:hover:bg-[#111111] transition-all duration-300 hover:scale-110 hover:shadow-lg"
                          title={platform}
                        >
                          {getIcon(platform)}
                        </a>
                      );
                    });
                  })()}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start w-full sm:w-auto">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowUpdateForm(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="w-full sm:w-auto"
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-lightCard/30 dark:border-darkCard/30 mb-6 scrollbar-hide">
        {['Overview', 'Points', 'My Tokens', 'My Communities'].map((tab) => {
          const tabValue = tab.toLowerCase().replace(' ', '-');
          return (
            <button
              key={tabValue}
              onClick={() => setActiveTab(tabValue)}
              className={
                cn(
                  'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
                  activeTab === tabValue
                    ? 'text-[#BBF10A] dark:text-[#BBF10A] border-b-2 border-[#BBF10A] dark:border-[#BBF10A]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black'
                )
              }
            >
              {tab}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {isValidUser && <ProfileStats user={user as User} className="mb-6" />}
            {isValidUser && <PointsOverview user={user as User} />}
          </div>
        )}
        
        {/* Points Tab */}
        {activeTab === 'points' && (
          <div className="space-y-6">
            {/* Points Summary */}
            {pointsData && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
                      Points Summary
                    </h2>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#BBF10A]" />
                      <span className="text-base sm:text-lg font-bold text-black dark:text-white">
                        {pointsData.summary.totalPointsEarned} Total Points
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Total Activities
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                        {pointsData.summary.totalActivities}
                      </span>
                    </div>
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-[#BBF10A]" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Activity Types
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                        {Object.keys(pointsData.summary.activityTypeCounts).length}
                      </span>
                    </div>
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Average per Activity
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                        {pointsData.summary.totalActivities > 0 
                          ? Math.round(pointsData.summary.totalPointsEarned / pointsData.summary.totalActivities)
                          : 0
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Points History */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
                    Points History
                  </h2>
                  {isLoadingPoints && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#BBF10A]"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                  )}
                </div>
                
                {isLoadingPoints ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#BBF10A]"></div>
                    <span className="ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading points history...</span>
                  </div>
                ) : pointsData && pointsData.pointsLogs.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                    {pointsData.pointsLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-lightCard dark:bg-darkCard rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow gap-2 sm:gap-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getActivityColor(log.activityType.name)}`}>
                            {getActivityIcon(log.activityType.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate">
                              {log.activityType.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {log.activityType.description}
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-sm sm:text-base font-bold text-green-500">
                            +{log.pointsEarned}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {log.activityType.pointsReward} pts reward
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                      No points history available yet
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Start participating in activities to earn points!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* My Tokens Tab */}
        {activeTab === 'my-tokens' && (
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              My Tokens
            </h2>
            <div className="space-y-3">
              {isValidUser && 'tokens' in user && user.tokens.map((token: any) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          </div>
        )}
        
        {/* My Communities Tab */}
        {activeTab === 'my-communities' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
                My Communities
              </h2>
              {isLoadingCommunities && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#BBF10A]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading communities...</span>
                </div>
              )}
            </div>
            
            {isLoadingCommunities ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#BBF10A] mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading your communities...
                  </p>
                </div>
              </div>
            ) : userCommunities.length > 0 ? (
              <div className="space-y-6">
                {/* Created Communities */}
                {userCommunities.filter(community => community.isOwner).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-purple-500" />
                      Communities I Created
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {userCommunities
                        .filter(community => community.isOwner)
                        .map((community) => {
                          const metadata = parseMetadata(community.details.metadata);
                          return (
                            <Card key={community.tribeId} className="hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        {community.details.name?.charAt(0)?.toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-black dark:text-white">
                                        {community.details.name || 'Unnamed Community'}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {community.details.memberCount || 0} members
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
                                    <Crown className="w-3 h-3" />
                                    <span className="text-xs font-medium">Owner</span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                  {metadata.description || 'No description available'}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/community/${community.tribeId}`)}
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    View Community
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Joined Communities */}
                {userCommunities.filter(community => !community.isOwner).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Communities I Joined
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {userCommunities
                        .filter(community => !community.isOwner)
                        .map((community) => {
                          const metadata = parseMetadata(community.details.metadata);
                          return (
                            <Card key={community.tribeId} className="hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        {community.details.name?.charAt(0)?.toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-black dark:text-white">
                                        {community.details.name || 'Unnamed Community'}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {community.details.memberCount || 0} members
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs font-medium">Member</span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                  {metadata.description || 'No description available'}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/community/${community.tribeId}`)}
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    View Community
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    No Communities Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't joined or created any communities yet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => navigate('/communities')}
                      className="w-full sm:w-auto"
                    >
                      Explore Communities
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/communities/create')}
                      className="w-full sm:w-auto"
                    >
                      Create Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Update Profile Form Modal */}
      {showUpdateForm && isValidUser && (
        <UpdateProfileForm
          user={user as User}
          onClose={() => setShowUpdateForm(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}