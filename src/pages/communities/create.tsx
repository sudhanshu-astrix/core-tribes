import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CommunityCreateForm } from '../../components/community/CommunityCreateForm';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/layout/PageTransition';

export default function CreateCommunityPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
            Create Community
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Build a vibrant community for your Web3 project
          </p>
        </div>

        <CommunityCreateForm />
      </div>
    </PageTransition>
  );
} 