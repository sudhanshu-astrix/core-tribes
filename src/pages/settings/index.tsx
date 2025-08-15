import { useState } from 'react';
import { Settings, User, Shield, Bell, Palette } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/layout/PageTransition';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-black dark:text-white hover:bg-lightCard/50 dark:hover:bg-darkCard/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-lightCard dark:bg-darkCard rounded-lg p-6">
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                    General Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 bg-transparent border border-border dark:border-borderDark rounded-lg text-black dark:text-white">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Time Zone
                      </label>
                      <select className="w-full px-3 py-2 bg-transparent border border-border dark:border-borderDark rounded-lg text-black dark:text-white">
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Profile Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-3 py-2 bg-transparent border border-border dark:border-borderDark rounded-lg text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Bio
                      </label>
                      <textarea
                        defaultValue="Web3 enthusiast and community builder"
                        rows={3}
                        className="w-full px-3 py-2 bg-transparent border border-border dark:border-borderDark rounded-lg text-black dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Profile Visibility</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow others to see your profile
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Activity Status</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Show when you're online
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Community Updates</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified about community activities
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Proposal Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified about new proposals
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Appearance Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Theme
                      </label>
                      <div className="flex items-center gap-4">
                        <ThemeToggle />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Font Size
                      </label>
                      <select className="w-full px-3 py-2 bg-transparent border border-border dark:border-borderDark rounded-lg text-black dark:text-white">
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border dark:border-borderDark">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 