import { useState, useEffect } from 'react';

interface VotingParams {
  quorumPercentage: number;
  votingDuration: number;
  executionDelay: number;
}

interface Role {
  address: string;
  role: string;
}

interface ContractConfig {
  governanceAddress: string;
  timelockAddress: string;
  treasuryAddress: string;
}

interface AnalyticsData {
  voterTurnout: { month: string; percentage: number }[];
  proposalStats: { id: string; voteCount: number; turnout: number; result: string }[];
}

interface GovernanceSettings {
  votingParams: VotingParams;
  roles: Role[];
  contractConfig: ContractConfig;
  analyticsData: AnalyticsData;
}

interface UseGovernanceSettingsResult {
  settings: GovernanceSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateVotingParams: (params: Partial<VotingParams>) => Promise<void>;
  updateRoles: (roles: Role[]) => Promise<void>;
  updateContractConfig: (config: Partial<ContractConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  archiveAllProposals: () => Promise<void>;
  deleteGovernanceSettings: () => Promise<void>;
}

export function useGovernanceSettings(): UseGovernanceSettingsResult {
  const [settings, setSettings] = useState<GovernanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/governance/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch governance settings');
      }
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateVotingParams = async (params: Partial<VotingParams>) => {
    try {
      const response = await fetch('/api/governance/settings/voting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to update voting parameters');
      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update voting parameters');
    }
  };

  const updateRoles = async (roles: Role[]) => {
    try {
      const response = await fetch('/api/governance/settings/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles })
      });
      if (!response.ok) throw new Error('Failed to update roles');
      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update roles');
    }
  };

  const updateContractConfig = async (config: Partial<ContractConfig>) => {
    try {
      const response = await fetch('/api/governance/settings/contract', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update contract configuration');
      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update contract configuration');
    }
  };

  const resetToDefaults = async () => {
    try {
      const response = await fetch('/api/governance/settings/reset', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to reset settings');
      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reset settings');
    }
  };

  const archiveAllProposals = async () => {
    try {
      const response = await fetch('/api/governance/proposals/archive', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to archive proposals');
      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to archive proposals');
    }
  };

  const deleteGovernanceSettings = async () => {
    try {
      const response = await fetch('/api/governance/settings', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete governance settings');
      setSettings(null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete governance settings');
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateVotingParams,
    updateRoles,
    updateContractConfig,
    resetToDefaults,
    archiveAllProposals,
    deleteGovernanceSettings
  };
} 