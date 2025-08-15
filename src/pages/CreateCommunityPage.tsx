import { useState } from 'react';
import { CommunityCreateForm } from '../components/community/CommunityCreateForm';
import { Card, CardContent } from '../components/ui/Card';

export function CreateCommunityPage() {
  return (
    <div className="max-w-3xl mx-auto h-[90vh] overflow-scroll">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Create Community</h1>
          <CommunityCreateForm />
        </CardContent>
      </Card>
    </div>
  );
} 