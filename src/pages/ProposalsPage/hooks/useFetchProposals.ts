import { useState, useEffect } from 'react';
import { Proposal } from '../../../types';

// Mock data for development
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: '1',
    title: 'Increase Community Fund',
    description: 'Proposal to increase the community fund allocation by 20% to support more initiatives.',
    category: 'funding',
    status: 'active',
    totalVotes: 120,
    options: [
      { id: 'yes', text: 'Yes', votes: 80, percentage: 67 },
      { id: 'no', text: 'No', votes: 40, percentage: 33 }
    ],
    community: {
      id: 'c1',
      name: 'Demo Community',
      logo: 'https://via.placeholder.com/40'
    },
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Change Governance Model',
    description: 'Proposal to implement a new quadratic voting system for better representation.',
    category: 'governance',
    status: 'passed',
    totalVotes: 98,
    options: [
      { id: 'yes', text: 'Yes', votes: 65, percentage: 66 },
      { id: 'no', text: 'No', votes: 33, percentage: 34 }
    ],
    community: {
      id: 'c1',
      name: 'Demo Community',
      logo: 'https://via.placeholder.com/40'
    },
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: 'Community Event Planning',
    description: 'Proposal to organize a quarterly community meetup with workshops and networking.',
    category: 'events',
    status: 'active',
    totalVotes: 45,
    options: [
      { id: 'yes', text: 'Yes', votes: 30, percentage: 67 },
      { id: 'no', text: 'No', votes: 15, percentage: 33 }
    ],
    community: {
      id: 'c1',
      name: 'Demo Community',
      logo: 'https://via.placeholder.com/40'
    },
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

interface UseFetchProposalsResult {
  proposals: Proposal[];
  isLoading: boolean;
  error: Error | null;
}

export function useFetchProposals(): UseFetchProposalsResult {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setProposals(MOCK_PROPOSALS);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, []);

  return { proposals, isLoading, error };
} 