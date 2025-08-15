import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface VerificationRequirement {
  id: string;
  type: 'document' | 'link' | 'question';
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected';
  response?: string;
  feedback?: string;
}

interface CommunityVerificationProps {
  community: {
    id: string;
    name: string;
    verificationStatus: 'unverified' | 'pending' | 'verified';
    requirements: VerificationRequirement[];
  };
  onRequirementSubmit: (requirementId: string, response: string) => void;
  onRequirementReview: (requirementId: string, status: 'approved' | 'rejected', feedback?: string) => void;
}

const DOCUMENT_TYPES = [
  'Government ID',
  'Business License',
  'Professional Certification',
  'Educational Certificate',
  'Other'
];

export function CommunityVerification({
  community,
  onRequirementSubmit,
  onRequirementReview
}: CommunityVerificationProps) {
  const [activeTab, setActiveTab] = useState('requirements');
  const [selectedRequirement, setSelectedRequirement] = useState<VerificationRequirement | null>(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!selectedRequirement || !response) return;
    onRequirementSubmit(selectedRequirement.id, response);
    setSelectedRequirement(null);
    setResponse('');
  };

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!selectedRequirement) return;
    onRequirementReview(selectedRequirement.id, status, feedback);
    setSelectedRequirement(null);
    setFeedback('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-[#BBF10A]';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-[#BBF10A]" />
            <div>
              <h3 className="text-lg font-semibold">Verification Status</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {community.verificationStatus === 'verified'
                  ? 'Your community is verified'
                  : community.verificationStatus === 'pending'
                  ? 'Your verification is under review'
                  : 'Your community is not verified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          <div className="space-y-4">
            {community.requirements.map(requirement => (
              <Card key={requirement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{requirement.title}</h4>
                        {requirement.required && (
                          <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {requirement.description}
                      </p>
                      {requirement.status !== 'pending' && (
                        <div className={`flex items-center gap-2 text-sm ${getStatusColor(requirement.status)}`}>
                          {getStatusIcon(requirement.status)}
                          <span className="capitalize">{requirement.status}</span>
                        </div>
                      )}
                      {requirement.feedback && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Feedback: {requirement.feedback}
                        </p>
                      )}
                    </div>
                    {requirement.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedRequirement(requirement)}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <div className="space-y-4">
            {community.requirements
              .filter(r => r.status !== 'pending')
              .map(requirement => (
                <Card key={requirement.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{requirement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {requirement.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(requirement.status)}
                        <span className={`capitalize ${getStatusColor(requirement.status)}`}>
                          {requirement.status}
                        </span>
                      </div>
                      {requirement.response && (
                        <div className="bg-lightCard dark:bg-darkCard rounded p-4">
                          <p className="text-sm">{requirement.response}</p>
                        </div>
                      )}
                      {requirement.feedback && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Feedback: {requirement.feedback}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submission Modal */}
      {selectedRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Submit {selectedRequirement.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequirement(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {selectedRequirement.type === 'document' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Document Type</label>
                    <Select
                      options={DOCUMENT_TYPES.map(type => ({ value: type, label: type }))}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    />
                  </div>
                )}

                {selectedRequirement.type === 'link' && (
                  <Input
                    label="Link"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter URL"
                  />
                )}

                {selectedRequirement.type === 'question' && (
                  <Textarea
                    label="Response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response"
                  />
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedRequirement(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!response}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 