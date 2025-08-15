import { useState, useEffect } from 'react';
import { GovernanceSettings } from '../GovernanceSettings';

interface UseGovernanceSettingsResult {
  settings: GovernanceSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: GovernanceSettings) => Promise<void>;
}

// Mock settings for development
const MOCK_SETTINGS: GovernanceSettings = {
  minVoteTokens: 100,
  votingPeriod: 7,
  quorum: 20,
  allowDelegation: true,
  allowVotingPower: true,
  roles: {
    admin: ['0x123...'],
    moderator: ['0x456...']
  }
};

export function useGovernanceSettings(): UseGovernanceSettingsResult {
  const [settings, setSettings] = useState<GovernanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSettings(MOCK_SETTINGS);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: GovernanceSettings) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSettings(newSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { settings, isLoading, error, updateSettings };
} 