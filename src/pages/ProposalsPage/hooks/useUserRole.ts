import { useMemo } from 'react';
import { useUser } from '../../../hooks/useUser';
import { useTokenBalance } from '../../../hooks/useTokenBalance';

// Default values for development
const DEFAULT_OWNER_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_MIN_VOTE_TOKENS = 100;

export function useUserRole() {
  const { user } = useUser();
  const { balance } = useTokenBalance();

  return useMemo(() => {
    const isAdmin = user?.roles?.includes('admin') || 
                   user?.address === DEFAULT_OWNER_ADDRESS;
    
    const isMember = user?.roles?.includes('member') && 
                    balance >= DEFAULT_MIN_VOTE_TOKENS;

    return { isAdmin, isMember };
  }, [user, balance]);
} 