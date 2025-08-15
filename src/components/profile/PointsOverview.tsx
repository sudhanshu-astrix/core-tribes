import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp, Users, MessageSquare, Vote, Calendar, Clock, Award } from 'lucide-react';
import { User } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { getUserPointsByAddress } from '../../services/BackendService';
import { useWalletStore } from '../../store/walletStore';

interface PointsOverviewProps {
  user: User;
  className?: string;
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

export function PointsOverview({ user, className }: PointsOverviewProps) {
  const { address } = useWalletStore();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate level based on total points
  const calculateLevel = (totalPoints: number): { level: number; progress: number; nextLevelPoints: number } => {
    const levelThresholds = [
      0, 100, 500, 2000, 5000, 10000, 20000, 50000, 100000, 200000, Infinity
    ];
    
    let level = 1;
    for (let i = 1; i < levelThresholds.length; i++) {
      if (totalPoints >= levelThresholds[i - 1] && totalPoints < levelThresholds[i]) {
        level = i;
        break;
      }
    }
    
    const currentLevelMin = levelThresholds[level - 1];
    const nextLevelMin = levelThresholds[level];
    const progress = Math.min(100, Math.max(0, ((totalPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100));
    
    return {
      level: Math.min(level, 10),
      progress: Math.round(progress),
      nextLevelPoints: nextLevelMin
    };
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

  // Fetch points data
  useEffect(() => {
    const fetchPointsData = async () => {
      if (address) {
        setIsLoading(true);
        try {
          const response = await getUserPointsByAddress(address);
          if (response && response.success) {
            setPointsData(response.data);
          }
        } catch (error) {
          console.error('Error fetching points data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPointsData();
  }, [address]);
  
  
  // const  pointsBreakdown = [
  //   {
  //     label: 'Posts',
  //     value: user.points.breakdown.posts,
  //     icon: MessageSquare,
  //     color: 'text-blue-500',
  //   },
  //   {
  //     label: 'Comments',
  //     value: user.points.breakdown.comments,
  //     icon: MessageSquare,
  //     color: 'text-green-500',
  //   },
  //   {
  //     label: 'Reactions',
  //     value: user.points.breakdown.reactions,
  //     icon: Star,
  //     color: 'text-yellow-500',
  //   },
  //   {
  //     label: 'Referrals',
  //     value: user.points.breakdown.referrals,
  //     icon: Users,
  //     color: 'text-purple-500',
  //   },
  //   {
  //     label: 'Events',
  //     value: user.points.breakdown.events,
  //     icon: TrendingUp,
  //     color: 'text-pink-500',
  //   },
  //   {
  //     label: 'Governance',
  //     value: user.points.breakdown.governance,
  //     icon: Vote,
  //     color: 'text-orange-500',
  //   },
  // ];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#BBF10A]"></div>
            <span className="ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading points...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = pointsData ? calculateLevel(pointsData.summary.totalPointsEarned) : { level: 1, progress: 0, nextLevelPoints: 100 };

  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white">
              Points & Rewards
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Level {levelInfo.level} • {pointsData?.summary.totalActivities || 0} Activities
            </p>
          </div>
          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-[#BBF10A]" />
            <span className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {pointsData?.summary.totalPointsEarned || 0}
            </span>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Progress to Level {levelInfo.level + 1}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {levelInfo.progress}%
            </span>
          </div>
          <div className="h-2 bg-lightCard dark:bg-darkCard rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-[#BBF10A] to-[#BBF10A]/80 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {pointsData?.summary.totalPointsEarned || 0} / {levelInfo.nextLevelPoints} points
          </p>
        </div>

        {/* Activity Type Summary */}
        {pointsData && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-3">
              Activity Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {Object.entries(pointsData.summary.activityTypeCounts).map(([activity, count]) => (
                <div
                  key={activity}
                  className="bg-lightCard dark:bg-darkCard rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`${getActivityColor(activity)}`}>
                      {getActivityIcon(activity)}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                      {activity}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    {count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points History */}
        {pointsData && pointsData.pointsLogs.length > 0 && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-3">
              Recent Activity
            </h4>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
              {pointsData.pointsLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-lightCard dark:bg-darkCard rounded-lg border border-gray-100 dark:border-gray-700 gap-2 sm:gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getActivityColor(log.activityType.name)}`}>
                      {getActivityIcon(log.activityType.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-black dark:text-white truncate">
                        {log.activityType.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()} • {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-xs sm:text-sm font-bold text-green-500">
                      +{log.pointsEarned}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {log.activityType.pointsReward} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!pointsData && !isLoading && (
          <div className="text-center py-6 sm:py-8">
            <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              No points data available yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}