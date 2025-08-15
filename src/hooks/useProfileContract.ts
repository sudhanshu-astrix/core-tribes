import { useState, useEffect, useCallback } from 'react';
import { profileContractService, ProfileData, ProfileMetadata, CreateProfileParams, UpdateProfileParams } from '@/services/ProfileContract';
import { useWalletStore } from '@/store/walletStore';

export interface UseProfileContractReturn {
  // Service state
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  
  // Contract info
  contractName: string | null;
  contractSymbol: string | null;
  contractOwner: string | null;
  
  // Profile operations
  createProfile: (params: CreateProfileParams) => Promise<number>;
  updateProfileMetadata: (params: UpdateProfileParams) => Promise<void>;
  getUserProfile: (address: string) => Promise<ProfileMetadata | null>;
  hasProfile: (address: string) => Promise<boolean>;
  usernameExists: (username: string) => Promise<boolean>;
  
  // Profile queries
  getProfileByTokenId: (tokenId: number) => Promise<ProfileMetadata>;
  getTokenIdByUsername: (username: string) => Promise<number>;
  ownerOf: (tokenId: number) => Promise<string>;
  balanceOf: (address: string) => Promise<number>;
  tokenURI: (tokenId: number) => Promise<string>;
  
  // Utility methods
  initialize: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export function useProfileContract(): UseProfileContractReturn {
  const { isConnected, address, chainId } = useWalletStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractName, setContractName] = useState<string | null>(null);
  const [contractSymbol, setContractSymbol] = useState<string | null>(null);
  const [contractOwner, setContractOwner] = useState<string | null>(null);

  // Initialize the contract service
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      await profileContractService.initialize();
      setIsInitialized(true);
      
      // Get contract info
      const [name, symbol, owner] = await Promise.all([
        profileContractService.name(),
        profileContractService.symbol(),
        profileContractService.owner()
      ]);
      
      setContractName(name);
      setContractSymbol(symbol);
      setContractOwner(owner);
      
      console.log('ProfileContract hook initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize ProfileContract';
      setError(errorMessage);
      console.error('ProfileContract initialization failed:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized]);

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (isConnected && address && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [isConnected, address, isInitialized, isInitializing, initialize]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsInitialized(false);
      setIsInitializing(false);
      setError(null);
      setContractName(null);
      setContractSymbol(null);
      setContractOwner(null);
      profileContractService.disconnect();
    }
  }, [isConnected]);

  // Reset when chain changes
  useEffect(() => {
    if (isInitialized && chainId) {
      // Re-initialize on chain change
      setIsInitialized(false);
      initialize();
    }
  }, [chainId, isInitialized, initialize]);

  // Wrapper functions with error handling
  const createProfile = useCallback(async (params: CreateProfileParams): Promise<number> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      const tokenId = await profileContractService.createProfile(params);
      return tokenId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const updateProfileMetadata = useCallback(async (params: UpdateProfileParams): Promise<void> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      await profileContractService.updateProfileMetadata(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile metadata';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const getUserProfile = useCallback(async (address: string): Promise<ProfileMetadata | null> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.getUserProfile(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user profile';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const hasProfile = useCallback(async (address: string): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.hasProfile(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check profile existence';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const usernameExists = useCallback(async (username: string): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.usernameExists(username);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check username existence';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const getProfileByTokenId = useCallback(async (tokenId: number): Promise<ProfileMetadata> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.getProfileByTokenId(tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get profile by token ID';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const getTokenIdByUsername = useCallback(async (username: string): Promise<number> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.getTokenIdByUsername(username);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token ID by username';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const ownerOf = useCallback(async (tokenId: number): Promise<string> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.ownerOf(tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get profile owner';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const balanceOf = useCallback(async (address: string): Promise<number> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.balanceOf(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get profile balance';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const tokenURI = useCallback(async (tokenId: number): Promise<string> => {
    if (!isInitialized) {
      throw new Error('ProfileContract not initialized');
    }
    
    setError(null);
    try {
      return await profileContractService.tokenURI(tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token URI';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const disconnect = useCallback(() => {
    profileContractService.disconnect();
    setIsInitialized(false);
    setIsInitializing(false);
    setError(null);
    setContractName(null);
    setContractSymbol(null);
    setContractOwner(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Service state
    isInitialized,
    isInitializing,
    error,
    
    // Contract info
    contractName,
    contractSymbol,
    contractOwner,
    
    // Profile operations
    createProfile,
    updateProfileMetadata,
    getUserProfile,
    hasProfile,
    usernameExists,
    
    // Profile queries
    getProfileByTokenId,
    getTokenIdByUsername,
    ownerOf,
    balanceOf,
    tokenURI,
    
    // Utility methods
    initialize,
    disconnect,
    clearError,
  };
} 