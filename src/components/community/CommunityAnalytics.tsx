import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Award,
  Shield,
  Download,
  Filter
} from 'lucide-react';
import { formatCompactNumber, formatDate } from '../../lib/utils';
import React from 'react';

interface CommunityAnalyticsProps {
  community: {
    id: string;
    name: string;
    memberCount: number;
    roles: {
      id: string;
      name: string;
      permissions: string[];
    }[];
  };
  userRole: string;
  onExport?: (type: string) => void;
}

interface AnalyticsData {
  memberGrowth: {
    total: number;
    new: number;
    active: number;
    byDay: { date: string; count: number }[];
  };
  engagement: {
    posts: number;
    comments: number;
    reactions: number;
    events: number;
    byDay: { date: string; count: number }[];
  };
  content: {
    totalPosts: number;
    totalEvents: number;
    totalProposals: number;
    topContent: {
      id: string;
      title: string;
      type: 'post' | 'event' | 'proposal';
      engagement: number;
    }[];
  };
  tokenGates: {
    total: number;
    active: number;
    byType: {
      type: string;
      count: number;
    }[];
    byNetwork: {
      network: string;
      count: number;
    }[];
  };
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

function SampleLineChart({ color = '#FFD600', label = '' }: { color?: string; label?: string }) {
  // Simple SVG line chart placeholder
  return (
    <svg width="100%" height="80" viewBox="0 0 200 80" fill="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
        points="0,60 30,50 60,65 90,40 120,30 150,50 180,20 200,35"
      />
      <text x="8" y="20" fontSize="12" fill={color} fontWeight="bold">{label}</text>
    </svg>
  );
}

export function CommunityAnalytics({ community, userRole, onExport }: CommunityAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has permission to view analytics
  const canViewAnalytics = community.roles?.find(role => role.id === userRole)?.permissions.includes('view_analytics') || false;

  useEffect(() => {
    if (canViewAnalytics) {
      // Simulate fetching analytics data
      // In a real app, this would be an API call
      setAnalyticsData({
        memberGrowth: {
          total: community.memberCount,
          new: 150,
          active: 1200,
          byDay: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            count: Math.floor(Math.random() * 50) + 1000
          }))
        },
        engagement: {
          posts: 450,
          comments: 1200,
          reactions: 3500,
          events: 25,
          byDay: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            count: Math.floor(Math.random() * 200) + 100
          }))
        },
        content: {
          totalPosts: 450,
          totalEvents: 25,
          totalProposals: 15,
          topContent: [
            { id: '1', title: 'Welcome to our community!', type: 'post', engagement: 250 },
            { id: '2', title: 'Community AMA', type: 'event', engagement: 180 },
            { id: '3', title: 'New Feature Proposal', type: 'proposal', engagement: 150 }
          ]
        },
        tokenGates: {
          total: 5,
          active: 3,
          byType: [
            { type: 'XRC-20', count: 2 },
            { type: 'XRC-721', count: 2 },
            { type: 'XRC-1155', count: 1 }
          ],
          byNetwork: [
            { network: 'XDC Mainnet', count: 3 },
            { network: 'XDC Apothem', count: 2 }
          ]
        }
      });
      setLoading(false);
    }
  }, [community.id, timeRange, canViewAnalytics]);

  if (!canViewAnalytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view community analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-lightCard dark:bg-darkCard rounded w-1/4 mx-auto"></div>
            <div className="h-32 bg-lightCard dark:bg-darkCard rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <h2 className="text-3xl font-bold">Community Analytics</h2>
        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={TIME_RANGES}
            aria-label="Select time range"
          />
          <Button
            variant="outline"
            onClick={() => onExport?.(timeRange)}
            className="flex items-center gap-2"
            disabled={!analyticsData}
            title={!analyticsData ? 'No data to export' : 'Export analytics'}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card>
          <CardContent>
            <div className="p-3 bg-[#BBF10A]/10 rounded-full">
              <Users className="h-6 w-6 text-[#BBF10A]" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Members</p>
              <p className="text-2xl font-bold leading-tight">{formatCompactNumber(analyticsData?.memberGrowth.total || 0)}</p>
              <p className="text-xs text-green-500 mt-1">+{formatCompactNumber(analyticsData?.memberGrowth.new || 0)} new</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Members</p>
              <p className="text-2xl font-bold leading-tight">{formatCompactNumber(analyticsData?.memberGrowth.active || 0)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 30 days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
              <p className="text-2xl font-bold leading-tight">{formatCompactNumber(analyticsData?.content.totalPosts || 0)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">+{formatCompactNumber(analyticsData?.engagement.comments || 0)} comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="p-3 bg-green-500/10 rounded-full">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Events</p>
              <p className="text-2xl font-bold leading-tight">{formatCompactNumber(analyticsData?.content.totalEvents || 0)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">+{formatCompactNumber(analyticsData?.engagement.events || 0)} this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-10" />
          <TabsContent value="overview">
            <Card>
              <CardContent>
                <h3 className="text-xl font-bold mb-8 text-black dark:text-white">Engagement Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-base font-semibold mb-4">Member Growth</h4>
                    <div className="h-56 bg-lightBg dark:bg-darkBg rounded-xl p-6 flex items-center justify-center">
                      <SampleLineChart color="#FFD600" label="Growth" />
                      <span className="sr-only">Line chart showing member growth over time</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold mb-4">Engagement Metrics</h4>
                    <div className="h-56 bg-lightBg dark:bg-darkBg rounded-xl p-6 flex items-center justify-center">
                      <SampleLineChart color="#4ADE80" label="Engagement" />
                      <span className="sr-only">Line chart showing engagement metrics over time</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-6">Member Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Member Activity</h4>
                    <div className="h-64 bg-lightCard dark:bg-darkCard rounded-xl p-6 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Member activity chart will be displayed here</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Member Distribution</h4>
                    <div className="h-64 bg-lightCard dark:bg-darkCard rounded-xl p-6 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Member distribution chart will be displayed here</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-6">Content Performance</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Top Performing Content</h4>
                    <div className="space-y-3">
                      {analyticsData?.content.topContent.map(content => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-4 bg-lightCard dark:bg-darkCard rounded-xl"
                        >
                          <div>
                            <p className="font-medium">{content.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {content.type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCompactNumber(content.engagement)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">engagements</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokenGates">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-6">Token Gate Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Token Gate Distribution</h4>
                    <div className="h-64 bg-lightCard dark:bg-darkCard rounded-xl p-6 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Token gate distribution chart will be displayed here</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Network Distribution</h4>
                    <div className="h-64 bg-lightCard dark:bg-darkCard rounded-xl p-6 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Network distribution chart will be displayed here</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 