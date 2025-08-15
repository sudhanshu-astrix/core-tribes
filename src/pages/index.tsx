import { useState } from 'react';
import { Search, TrendingUp, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
// Remove: import { useRouter } from 'next/router';
import { mockFeedItems, mockCommunities, mockProposalsWithAuthor } from '../data/mockData';
import { FeedItem } from '../components/home/FeedItem';
import { TrendingCommunities } from '../components/home/TrendingCommunities';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { motion } from 'framer-motion';

// Import new components and types
import { RecentProposals } from '../components/home/RecentProposals';
import { UpcomingEvents } from '../components/home/UpcomingEvents';
import { Proposal, LiveSession, FeedItem as FeedItemType } from '../types'; // Assuming FeedItemType contains structure of mockFeedItems elements
import { isDateInFuture } from '../lib/utils'; // Assuming this utility exists and works for dates

type FeedTab = 'for-you' | 'discover' | 'trending';

// Helper function to determine active tab from pathname
const getActiveTabFromPathname = (pathname: string): FeedTab => {
  if (pathname.startsWith('/home/discover')) return 'discover';
  if (pathname.startsWith('/home/trending')) return 'trending';
  // Default to 'for-you' for /, /home/for-you, or any other /home/ path not matched above
  return 'for-you';
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>(getActiveTabFromPathname(window.location.pathname));

  const [showFilters, setShowFilters] = useState(false);

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto">
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
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary focus:outline-none focus:ring-2 focus:ring-neonBlue/50"
                />
              </div>
              <Button
                variant="outline"
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
                ].map((tab) => (
                  <Link
                    key={tab.id}
                    to={`/home/${tab.id}`}
                    className={`px-6 py-3 relative ${
                      activeTab === tab.id
                        ? 'text-[#BBF10A] dark:text-[#BBF10A]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black'
                    }`}
                    onClick={() => setActiveTab(tab.id as FeedTab)}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#BBF10A] rounded-t-full"
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
              <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4 mb-6">
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
                  <RecentProposals proposals={mockProposalsWithAuthor} />
                  <UpcomingEvents events={
                    mockFeedItems
                      .filter((item): item is FeedItemType & { data: LiveSession } => 
                        item?.type === 'event' && 
                        !!item?.data && 
                        (item?.data?.status === 'upcoming' || (item?.data?.startTime ? isDateInFuture(item?.data?.startTime) : false))
                      )
                      .map(item => item.data)
                      // Optionally, sort by start time
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  } />
                </>
              )}
              
              {activeTab === 'discover' && (
                <div className="space-y-4">
                  {mockFeedItems
                    .filter((item) => item.type === 'post')
                    .map((item, index) => (
                      <FeedItem key={`${item.type}-${item.data.id || index}`} item={item} />
                  ))}
                </div>
              )}

              {activeTab === 'trending' && (
                <div className="space-y-4">
                  {mockFeedItems
                    .filter((item) => item.type === 'post') // Keep filtering for posts for trending
                    .slice(0, 3) // Maybe show fewer for trending, e.g., top 3 posts
                    .map((item, index) => (
                      <div key={`${item.type}-trending-${item.data.id || index}`} className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-5 w-5 text-[#BBF10A]" />
                          <span className="text-sm font-semibold text-black dark:text-white">Trending in Web3</span>
                        </div>
                        <FeedItem item={item} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <TrendingCommunities communities={mockCommunities} />
            
            <div className="bg-lightCard dark:bg-darkCard rounded-lg p-5 border border-lightCard/30 dark:border-darkCard/30">
              <h3 className="font-semibold text-black dark:text-white mb-3">Welcome to Tribes!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Explore vibrant communities, have a say in how they're run, and keep track of your digital memberships and collectibles—all in one spot.
              </p>
              <Link to="/learn-more"> {/* Assuming a '/learn-more' page or section exists or will be created */}
                <div className="text-xs text-[#BBF10A] dark:text-[#BBF10A] hover:underline">
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