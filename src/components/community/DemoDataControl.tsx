import { useState } from 'react';
import { Database, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { toggleDemoData, USE_DEMO_DATA } from '../../data/demoData';

export function DemoDataControl() {
  const [isDemoEnabled, setIsDemoEnabled] = useState(USE_DEMO_DATA);
  const [isVisible, setIsVisible] = useState(true);

  const handleToggleDemo = (enabled: boolean) => {
    setIsDemoEnabled(enabled);
    toggleDemoData(enabled);
  };

  const handleRefreshDemo = () => {
    // In a real app, this would refresh the demo data
    console.log('Refreshing demo data...');
    window.location.reload();
  };

  const handleClearDemo = () => {
    // In a real app, this would clear all demo data
    console.log('Clearing demo data...');
    handleToggleDemo(false);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-accentBlue text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Database className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 w-80 bg-lightCard dark:bg-darkCard shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#BBF10A]" />
          <h3 className="font-semibold text-black dark:text-white">Demo Data Control</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-600 dark:text-gray-400 hover:text-lightText dark:hover:text-black"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Demo Data Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black dark:text-white">Demo Data</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Show sample events, posts, polls, and proposals
            </p>
          </div>
          <Switch
            checked={isDemoEnabled}
            onChange={handleToggleDemo}
          />
        </div>

        {/* Status Indicator */}
        <div className={`p-2 rounded-lg text-sm ${
          isDemoEnabled 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          <div className="flex items-center space-x-2">
            {isDemoEnabled ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Demo data is active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Demo data is disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleRefreshDemo}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button
            onClick={handleClearDemo}
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {/* Quick Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• Demo data includes sample events, posts, polls, and governance proposals</p>
          <p>• Toggle off to see empty states</p>
          <p>• Changes take effect immediately</p>
        </div>
      </div>
    </Card>
  );
} 