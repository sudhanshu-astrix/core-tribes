import { useState } from 'react';
import { Settings, Edit, Trophy, Users, Calendar } from 'lucide-react';
import { ProfileStats } from '../components/profile/ProfileStats';
import { PointsOverview } from '../components/profile/PointsOverview';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/layout/PageTransition';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'activity', label: 'Activity', icon: Calendar },
  ];

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account and view your activity
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-lightCard dark:bg-darkCard rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-black text-2xl font-bold">
                  JD
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    John Doe
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Web3 enthusiast and community builder
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Member since 2023</span>
                    <span>Level 5</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="border-b border-lightCard/30 dark:border-darkCard/30 mb-6">
              <div className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 relative flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'text-primary'
                          : 'text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        No recent activity to show.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'communities' && (
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    My Communities
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        You haven't joined any communities yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Activity History
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        No activity history available.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ProfileStats />
            <PointsOverview />
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 