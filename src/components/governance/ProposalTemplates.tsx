import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProposalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface ProposalTemplatesProps {
  templates: ProposalTemplate[];
  onUseTemplate: (template: ProposalTemplate) => void;
  onCreateTemplate: () => void;
}

export function ProposalTemplates({
  templates,
  onUseTemplate,
  onCreateTemplate
}: ProposalTemplatesProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Proposal Templates
        </h3>
        <Button
          variant="primary"
          onClick={onCreateTemplate}
        >
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer hover:border-accent transition-colors"
            onClick={() => onUseTemplate(template)}
          >
            <div className="space-y-2">
              <h4 className="font-medium text-black dark:text-white">
                {template.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-lightCard dark:bg-darkCard text-gray-600 dark:text-gray-400">
                  {template.category}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseTemplate(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
} 