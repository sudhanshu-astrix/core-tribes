import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { VotingPowerCard } from '../../components/governance/VotingPowerCard';
import { ProposalTemplates } from '../../components/governance/ProposalTemplates';

interface ProposalInput {
  title: string;
  description: string;
  category: string;
}

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalInput) => void;
  votingPower: number;
  delegatedTo?: {
    address: string;
    name: string;
    avatar?: string;
  };
  onDelegate?: () => void;
  onUndelegate?: () => void;
  templates?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
  }>;
}

const CATEGORIES = [
  { value: 'funding', label: 'Funding' },
  { value: 'governance', label: 'Governance' },
  { value: 'events', label: 'Events' },
  { value: 'other', label: 'Other' }
];

export function CreateProposalModal({
  isOpen,
  onClose,
  onSubmit,
  votingPower,
  delegatedTo,
  onDelegate,
  onUndelegate,
  templates = []
}: CreateProposalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<Partial<ProposalInput>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ProposalInput> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ title, description, category });
      setTitle('');
      setDescription('');
      setCategory('');
      setErrors({});
    }
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Proposal"
    >
      <div className="space-y-6">
        <VotingPowerCard
          votingPower={votingPower}
          delegatedTo={delegatedTo}
          onDelegate={onDelegate}
          onUndelegate={onUndelegate}
        />

        {templates.length > 0 && (
          <ProposalTemplates
            templates={templates}
            onUseTemplate={handleUseTemplate}
            onCreateTemplate={() => {/* TODO: Implement template creation */}}
          />
        )}

        <div className="space-y-4">
          <div>
            <Input
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              error={errors.title}
              placeholder="Enter proposal title"
            />
          </div>

          <div>
            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Describe your proposal..."
              rows={4}
            />
          </div>

          <div>
            <Select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={CATEGORIES}
              error={errors.category}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              Create Proposal
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 