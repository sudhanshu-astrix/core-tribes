import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Loader2, Users, Crown } from 'lucide-react';
import { UserTribeCard } from '../../components/cards/UserTribeCard';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/layout/PageTransition';
import { tribeContractService } from '../../services/TribeContract';
import { TribeDetails } from '../../services/TribeContract';
import { useWalletStore } from '../../store/walletStore';

interface UserTribeWithId extends TribeDetails {
  tribeId: number;
}

export default function CommunitiesPage() {
  const { address } = useWalletStore();
  const [userTribes, setUserTribes] = useState<UserTribeWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load user-created tribes from blockchain
  useEffect(() => {
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
        
        // Get user's tribe IDs using getUserTribes
        const tribeIds = await tribeContractService.getUserTribes(address);
        console.log('User tribe IDs:', tribeIds);
        
        // Get details for each tribe using getTribeDetails
        const tribesWithDetails: UserTribeWithId[] = [];
        
        for (const tribeId of tribeIds) {
          try {
            console.log(`Fetching details for tribe ${tribeId}...`);
            
            // Check if tribe exists
            const exists = await tribeContractService.getTribeExists(tribeId);
            if (!exists) {
              console.log(`Tribe ${tribeId} does not exist, skipping...`);
              continue;
            }
            
            // Get tribe details using getTribeDetails
            const tribeDetails = await tribeContractService.getTribeDetails(tribeId);
            
            // Get member count using getMemberCount
            const memberCount = await tribeContractService.getMemberCount(tribeId);
            
            // Create enhanced tribe details with accurate member count and tribe ID
            const enhancedTribe: UserTribeWithId = {
              ...tribeDetails,
              memberCount: Number(memberCount),
              tribeId: tribeId
            };
            
            tribesWithDetails.push(enhancedTribe);
            console.log(`Successfully fetched tribe ${tribeId}: ${tribeDetails.name} with ${memberCount} members`);
          } catch (error) {
            console.warn(`Failed to get details for tribe ${tribeId}:`, error);
            // Continue with next tribe
          }
        }
        
        console.log(`Successfully fetched ${tribesWithDetails.length} user tribes`);
        setUserTribes(tribesWithDetails);
      } catch (err) {
        console.error('Failed to load user tribes:', err);
        setError('Failed to load your communities from blockchain');
      } finally {
        setLoading(false);
      }
    };

    loadUserTribes();
  }, [address]);

  // Parse metadata to get additional tribe info
  const parseMetadata = (metadata: string) => {
    try {
      return JSON.parse(metadata);
    } catch {
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

  // Filter tribes based on search and category
  const filteredTribes = userTribes.filter(tribe => {
    const metadata = parseMetadata(tribe.metadata);
    const matchesSearch = tribe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metadata.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metadata.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from tribes
  const categories = ['all', ...Array.from(new Set(userTribes.map(tribe => {
    const metadata = parseMetadata(tribe.metadata);
    return metadata.category;
  })))];

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading your communities from blockchain...
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
              <Crown className="w-8 h-8 text-primary" />
              My Communities
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and interact with your created communities
            </p>
          </div>
          <Link to="/communities/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Community
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search your communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Tribes Grid */}
        {filteredTribes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400">
              {userTribes.length === 0 ? (
                <div>
                  <Crown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-4">You haven't created any communities yet</p>
                  <p className="mb-6">Start building your first community and bring people together!</p>
                  <Link to="/communities/create">
                    <Button>Create Your First Community</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-4">No communities match your search</p>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTribes.map((tribe) => (
              <UserTribeCard
                key={tribe.tribeId}
                tribe={tribe}
                tribeId={tribe.tribeId}
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {userTribes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your Communities
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {userTribes.reduce((total, tribe) => total + tribe.memberCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Members
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {userTribes.filter(tribe => tribe.joinType === 0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Public Communities
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {userTribes.filter(tribe => tribe.joinType !== 0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Private Communities
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 