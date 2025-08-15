import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { 
  Flag, 
  AlertTriangle, 
  Shield, 
  Filter,
  Check,
  X,
  Clock,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface ModerationToolsProps {
  community: {
    id: string;
    name: string;
  };
  userRole: string;
}

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user';
  reason: string;
  description: string;
  reportedBy: {
    id: string;
    username: string;
    avatar?: string;
  };
  reportedItem: {
    id: string;
    content?: string;
    author?: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    username: string;
  };
}

interface Warning {
  id: string;
  userId: string;
  username: string;
  reason: string;
  issuedBy: {
    id: string;
    username: string;
  };
  issuedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'removed';
}

interface FilterConfig {
  profanity: {
    enabled: boolean;
    customWords: string[];
    action: 'warn' | 'block' | 'flag';
    notifyModerators: boolean;
  };
  spam: {
    enabled: boolean;
    maxLinks: number;
    maxMentions: number;
    cooldownMinutes: number;
    action: 'warn' | 'block' | 'flag';
  };
  links: {
    enabled: boolean;
    allowedDomains: string[];
    blockSuspicious: boolean;
    requireApproval: boolean;
  };
}

export function ModerationTools({ community, userRole }: ModerationToolsProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [filter, setFilter] = useState('all');
  const [showConfigModal, setShowConfigModal] = useState<'profanity' | 'spam' | 'links' | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    profanity: {
      enabled: true,
      customWords: ['badword1', 'badword2'],
      action: 'warn',
      notifyModerators: true,
    },
    spam: {
      enabled: true,
      maxLinks: 3,
      maxMentions: 5,
      cooldownMinutes: 5,
      action: 'warn',
    },
    links: {
      enabled: true,
      allowedDomains: ['example.com', 'trusted.com'],
      blockSuspicious: true,
      requireApproval: false,
    }
  });

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      type: 'post',
      reason: 'Inappropriate Content',
      description: 'Post contains offensive language',
      reportedBy: {
        id: 'user1',
        username: 'reporter1',
      },
      reportedItem: {
        id: 'post1',
        content: 'Sample post content',
        author: {
          id: 'user2',
          username: 'author1',
        },
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    // Add more mock reports as needed
  ]);

  const [warnings, setWarnings] = useState<Warning[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'user1',
      reason: 'Multiple rule violations',
      issuedBy: {
        id: 'mod1',
        username: 'moderator1',
      },
      issuedAt: new Date().toISOString(),
      status: 'active',
    },
    // Add more mock warnings as needed
  ]);

  const handleReportAction = (reportId: string, action: 'approve' | 'reject') => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          status: action === 'approve' ? 'resolved' : 'reviewed',
          reviewedAt: new Date().toISOString(),
          reviewedBy: {
            id: 'current-user',
            username: 'Current User',
          },
        };
      }
      return report;
    }));
  };

  const handleWarningAction = (warningId: string, action: 'remove' | 'extend') => {
    setWarnings(warnings.map(warning => {
      if (warning.id === warningId) {
        return {
          ...warning,
          status: action === 'remove' ? 'removed' : 'active',
          expiresAt: action === 'extend' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : warning.expiresAt,
        };
      }
      return warning;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Moderation Tools</h2>
        <div className="flex items-center gap-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'resolved', label: 'Resolved' },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="warnings">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Warnings
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="h-4 w-4 mr-2" />
            Content Filters
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          report.status === 'pending' ? 'bg-[#BBF10A]/10 text-[#BBF10A]' :
                          report.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">Reported {report.type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Reason: {report.reason}
                      </p>
                      {report.reportedItem.content && (
                        <p className="text-sm mb-2">{report.reportedItem.content}</p>
                      )}
                      <div className="text-sm">
                        <p>Reported by: {report.reportedBy.username}</p>
                        {report.reportedItem.author && (
                          <p>Author: {report.reportedItem.author.username}</p>
                        )}
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="text-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'reject')}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warnings Tab */}
        <TabsContent value="warnings">
          <div className="space-y-4">
            {warnings.map(warning => (
              <Card key={warning.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          warning.status === 'active' ? 'bg-red-500/10 text-red-500' :
                          warning.status === 'expired' ? 'bg-gray-500/10 text-gray-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {warning.status}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(warning.issuedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{warning.username}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Reason: {warning.reason}
                      </p>
                      <div className="text-sm">
                        <p>Issued by: {warning.issuedBy.username}</p>
                        {warning.expiresAt && (
                          <p>Expires: {formatDate(warning.expiresAt)}</p>
                        )}
                      </div>
                    </div>
                    {warning.status === 'active' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWarningAction(warning.id, 'extend')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Extend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWarningAction(warning.id, 'remove')}
                          className="text-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Filters Tab */}
        <TabsContent value="filters">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Filtering Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lightCard dark:bg-darkCard rounded">
                  <div>
                    <h4 className="font-medium">Profanity Filter</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically filter out profanity in posts and comments
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-lightCard dark:bg-darkCard rounded">
                  <div>
                    <h4 className="font-medium">Spam Detection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detect and filter spam content
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-lightCard dark:bg-darkCard rounded">
                  <div>
                    <h4 className="font-medium">Link Filtering</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Filter suspicious or unauthorized links
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 