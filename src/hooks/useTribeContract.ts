import { useState, useCallback } from 'react';
import { tribeContractService, CreateTribeParams, CreateTribeResult, JoinType, NFTType } from '../services/TribeContract';

export const useTribeContract = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the contract service
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await tribeContractService.initialize();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize contract';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new tribe
  const createTribe = useCallback(async (params: CreateTribeParams): Promise<CreateTribeResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.createTribe(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tribe';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Get next tribe ID
  const getNextTribeId = useCallback(async (): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getNextTribeId();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get next tribe ID';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Get tribe details
  const getTribeDetails = useCallback(async (tribeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getTribeDetails(tribeId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get tribe details';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Check if tribe exists
  const getTribeExists = useCallback(async (tribeId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getTribeExists(tribeId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check if tribe exists';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Get user's tribes
  const getUserTribes = useCallback(async (userAddress: string): Promise<number[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getUserTribes(userAddress);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user tribes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Join a tribe
  const joinTribe = useCallback(async (tribeId: number): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.joinTribe(tribeId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join tribe';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Join tribe with invite code
  const joinTribeWithCode = useCallback(async (tribeId: number, inviteCode: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.joinTribeWithCode(tribeId, inviteCode);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join tribe with code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Request to join tribe
  const requestToJoinTribe = useCallback(async (tribeId: number, entryFee?: number): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.requestToJoinTribe(tribeId, entryFee);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request to join tribe';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Check if address is member
  const isMember = useCallback(async (tribeId: number, memberAddress: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.isMember(tribeId, memberAddress);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check if address is member';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Get member count
  const getMemberCount = useCallback(async (tribeId: number): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getMemberCount(tribeId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get member count';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Create invite code
  const createInviteCode = useCallback(async (tribeId: number, code: string, maxUses: number, expiryTime: number): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.createInviteCode(tribeId, code, maxUses, expiryTime);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invite code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Get invite code status
  const getInviteCodeStatus = useCallback(async (tribeId: number, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isInitialized) {
        await initialize();
      }
      
      const result = await tribeContractService.getInviteCodeStatus(tribeId, code);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get invite code status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Actions
    initialize,
    createTribe,
    getNextTribeId,
    getTribeDetails,
    getTribeExists,
    getUserTribes,
    joinTribe,
    joinTribeWithCode,
    requestToJoinTribe,
    isMember,
    getMemberCount,
    createInviteCode,
    getInviteCodeStatus,
    clearError,
    
    // Constants
    JoinType,
    NFTType
  };
}; 