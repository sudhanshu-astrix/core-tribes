import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { GovernanceSettings } from './GovernanceSettings';
import { useGovernanceSettings } from './hooks/useGovernanceSettings';

export function SettingsPage() {
  const { settings, isLoading, error, updateSettings } = useGovernanceSettings();
  const [activeTab, setActiveTab] = useState('general');

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error loading settings: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">General Settings</h2>
            {/* Add general settings content here */}
          </div>
        </TabsContent>

        <TabsContent value="governance">
          <div className="mt-6">
            <GovernanceSettings onSave={updateSettings} />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
            {/* Add notification settings content here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 