import { useState } from 'react';
import { Shield, AlertTriangle, UserX, MessageSquare, Flag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user';
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reportedAt: string;
  reportedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  reportedItem: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

interface ModAction {
  id: string;
  type: 'warn' | 'mute' | 'ban';
  reason: string;
  duration?: string;
  createdAt: string;
  moderator: {
    id: string;
    name: string;
    avatar: string;
  };
  target: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface CommunityModerationProps {
  communityId: string;
  reports: Report[];
  modActions: ModAction[];
  onAction: (action: {
    type: 'warn' | 'mute' | 'ban';
    userId: string;
    reason: string;
    duration?: string;
  }) => void;
  onReportResolve: (reportId: string, action: 'dismiss' | 'take-action') => void;
}

export function CommunityModeration({
  communityId,
  reports,
  modActions,
  onAction,
  onReportResolve
}: CommunityModerationProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedUser, setSelectedUser] = useState('');
  const [actionType, setActionType] = useState<'warn' | 'mute' | 'ban'>('warn');
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState('');

  const handleAction = () => {
    if (!selectedUser || !actionReason) return;

    onAction({
      type: actionType,
      userId: selectedUser,
      reason: actionReason,
      duration: actionType === 'mute' ? actionDuration : undefined
    });

    // Reset form
    setSelectedUser('');
    setActionType('warn');
    setActionReason('');
    setActionDuration('');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Shield className="h-4 w-4 mr-2" />
            Mod Actions
          </TabsTrigger>
          <TabsTrigger value="tools">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mod Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                          {report.type}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Reported by {report.reportedBy.name}
                        </span>
                      </div>
                      <p className="text-sm">{report.reason}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {report.reportedItem.content}
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReportResolve(report.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onReportResolve(report.id, 'take-action')}
                        >
                          Take Action
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-4">
            {modActions.map(action => (
              <Card key={action.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                          {action.type}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          by {action.moderator.name}
                        </span>
                      </div>
                      <p className="text-sm">{action.reason}</p>
                      {action.duration && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {action.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select User</label>
                  <Input
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    placeholder="Enter user ID or username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Action Type</label>
                  <Select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as 'warn' | 'mute' | 'ban')}
                    options={[
                      { value: 'warn', label: 'Warning' },
                      { value: 'mute', label: 'Mute' },
                      { value: 'ban', label: 'Ban' }
                    ]}
                  />
                </div>

                {actionType === 'mute' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration</label>
                    <Input
                      value={actionDuration}
                      onChange={(e) => setActionDuration(e.target.value)}
                      placeholder="e.g., 24h, 7d, 30d"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <Input
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter reason for action"
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handleAction}
                  disabled={!selectedUser || !actionReason}
                >
                  Take Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 