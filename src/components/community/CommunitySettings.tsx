import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Switch } from '../ui/Switch';

interface CommunitySettingsProps {
  community: {
    id: string;
    name: string;
    description: string;
    category: string;
    isPrivate: boolean;
    guidelines: string;
    tags: string[];
    settings: {
      allowMemberInvites: boolean;
      requireApproval: boolean;
      allowMemberPosts: boolean;
      allowMemberEvents: boolean;
      allowMemberProposals: boolean;
      defaultRole: string;
    };
  };
  onSave: (data: any) => void;
}

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' }
];

export function CommunitySettings({ community, onSave }: CommunitySettingsProps) {
  const [settings, setSettings] = useState(community.settings);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Input
                  label="Community Name"
                  value={community.name}
                  disabled
                />
                <Textarea
                  label="Description"
                  value={community.description}
                  disabled
                />
                <Select
                  label="Category"
                  value={community.category}
                  disabled
                  options={[{ value: community.category, label: community.category }]}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPrivate"
                    checked={community.isPrivate}
                    disabled
                  />
                  <label htmlFor="isPrivate" className="text-sm">Private Community</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Member Invites</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Members can invite others to join the community
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMemberInvites}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowMemberInvites: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require Post Approval</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New posts must be approved by moderators
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, requireApproval: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Member Posts</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Members can create new posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMemberPosts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowMemberPosts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Member Events</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Members can create events
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMemberEvents}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowMemberEvents: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Member Proposals</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Members can create proposals
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMemberProposals}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowMemberProposals: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Select
                  label="Default Member Role"
                  value={settings.defaultRole}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, defaultRole: e.target.value }))
                  }
                  options={ROLES}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Textarea
                  label="Community Guidelines"
                  value={community.guidelines}
                  disabled
                />
                <div className="flex flex-wrap gap-2">
                  {community.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} variant="primary">
          Save Changes
        </Button>
      </div>
    </div>
  );
} 