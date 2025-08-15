import { useState, useEffect } from 'react';

export function useTokenBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/token/balance');
        if (!response.ok) {
          throw new Error('Failed to fetch token balance');
        }
        const data = await response.json();
        setBalance(data.balance);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return { balance, isLoading, error };
} 