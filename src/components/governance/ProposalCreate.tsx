import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const TEMPLATES = [
  { value: '', label: 'Blank' },
  { value: 'funding', label: 'Funding Request' },
  { value: 'governance', label: 'Governance Change' },
  { value: 'event', label: 'Event Proposal' }
];
const CATEGORIES = [
  { value: 'funding', label: 'Funding' },
  { value: 'governance', label: 'Governance' },
  { value: 'events', label: 'Events' },
  { value: 'other', label: 'Other' }
];
const TEMPLATE_CONTENT = {
  funding: 'This proposal requests funding for...',
  governance: 'This proposal suggests a change to governance...',
  event: 'This proposal is for organizing an event...'
};

export function ProposalCreate({ user, community, onSubmit }: {
  user: { id: string; name: string };
  community: { id: string; name: string };
  onSubmit: (data: any) => void;
}) {
  const [template, setTemplate] = useState('');
  const [category, setCategory] = useState('funding');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTemplate = (val: string) => {
    setTemplate(val);
    setContent(TEMPLATE_CONTENT[val as keyof typeof TEMPLATE_CONTENT] || '');
  };

  const handleSubmit = () => {
    onSubmit({
      template,
      category,
      title,
      content,
      userId: user.id,
      communityId: community.id
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex gap-2">
          <Select label="Template" value={template} onChange={e => handleTemplate(e.target.value)} options={TEMPLATES} />
          <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={CATEGORIES} />
        </div>
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Proposal title" />
        <Textarea label="Content" value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your proposal..." rows={6} />
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSubmit} disabled={!title || !content}>
            Submit Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 