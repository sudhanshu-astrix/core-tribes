import { useState, useEffect } from 'react';
import { Users, Wallet, TrendingUp, DollarSign, Crown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { User } from '../../types';
import { formatCurrency, getNetworkName } from '../../lib/utils';
import { useWalletStore } from '@/store/walletStore';
import { cryptoExchangeRate } from '../../services/BackendService';
import { tribeContractService } from '../../services/TribeContract';

interface ProfileStatsProps {
  user: User;
  className?: string;
}

interface CommunityStats {
  joinedCount: number;
  createdCount: number;
  isLoading: boolean;
}

export function ProfileStats({ user, className }: ProfileStatsProps) {
  const { balance, chainId, isConnected, address, getBalance } = useWalletStore();
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    joinedCount: 0,
    createdCount: 0,
    isLoading: true
  });

  // Get network name for display
  const networkName = chainId ? getNetworkName(chainId) : 'ETH';

  // Initialize balance on component mount if wallet is connected
  useEffect(() => {
    if (isConnected && address && !balance) {
      console.log('Initializing balance for connected wallet...');
      getBalance();
    }
  }, [isConnected, address, balance, getBalance]);

  // Fetch community stats
  useEffect(() => {
    const fetchCommunityStats = async () => {
      if (!address) {
        setCommunityStats({ joinedCount: 0, createdCount: 0, isLoading: false });
        return;
      }

      try {
        setCommunityStats(prev => ({ ...prev, isLoading: true }));
        
        // Initialize tribe contract service
        await tribeContractService.initialize();
        
        // Get user's joined tribes
        const joinedTribeIds = await tribeContractService.getUserTribes(address);
        
        // Get all tribes to check which ones the user created (is admin)
        const allTribes = await tribeContractService.getAllTribes();
        
        // Count created tribes (where user is admin)
        let createdCount = 0;
        for (const tribe of allTribes) {
          if (tribe.admin.toLowerCase() === address.toLowerCase()) {
            createdCount++;
          }
        }

        setCommunityStats({
          joinedCount: joinedTribeIds.length,
          createdCount,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        setCommunityStats({ joinedCount: 0, createdCount: 0, isLoading: false });
      }
    };

    fetchCommunityStats();
  }, [address]);

  // Fetch exchange rate for native currency
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (chainId) {
        setIsLoadingRate(true);
        try {
          // Map chainId to currency symbol
          let currencySymbol = 'ETH';
          switch (chainId) {
            case 1: // Ethereum Mainnet
              currencySymbol = 'ETH';
              break;
            case 137: // Polygon
              currencySymbol = 'MATIC';
              break;
            case 56: // BSC
              currencySymbol = 'BNB';
              break;
            case 50: // Arbitrum
              currencySymbol = 'XDC';
              break;
            default:
              currencySymbol = 'XDC';
          }

          const response = await cryptoExchangeRate(currencySymbol);
          console.log("response", response);
          if (response && response.result) {
            const rate = response.result.USD;
            setUsdRate(rate);
            if (balance) {
              setUsdValue(parseFloat(balance) * rate);
            }
          }
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
        } finally {
          setIsLoadingRate(false);
        }
      }
    };

    fetchExchangeRate();
  }, [chainId, balance]);

  const statItems = [
    {
      icon: Users,
      label: 'Communities',
      value: communityStats.isLoading ? '...' : communityStats.joinedCount.toString(),
      subtitle: communityStats.isLoading ? 'Loading...' : 'Joined',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      isLoading: communityStats.isLoading,
    },
    {
      icon: Crown,
      label: 'Created',
      value: communityStats.isLoading ? '...' : communityStats.createdCount.toString(),
      subtitle: communityStats.isLoading ? 'Loading...' : 'Communities',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      isLoading: communityStats.isLoading,
    },
    {
      icon: Wallet,
      label: 'Native Balance',
      value: balance ? `${parseFloat(balance).toFixed(4)} ${networkName}` : '0.0000',
      subtitle: isLoadingRate 
        ? 'Loading XDC rate...' 
        : usdValue 
          ? `≈ ${formatCurrency(usdValue)}` 
          : usdRate 
            ? `1 XDC = $${usdRate.toFixed(4)}` 
            : 'No USD rate',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      isLoading: isLoadingRate,
    },
  ];
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 overflow-hidden ${item.bgColor}`}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm ${item.color}`}>
                  {item.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current"></div>
                  ) : (
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                    {item.label}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-black dark:text-white truncate">
                    {item.value}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {item.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-current"></div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {item.subtitle}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Exchange rate indicator for native balance */}
              {item.label === 'Native Balance' && usdRate && !isLoadingRate && (
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>1 XDC = ${usdRate.toFixed(4)}</span>
                  </div>
                </div>
              )}
              
              {/* Loading indicator for exchange rate */}
              {item.label === 'Native Balance' && isLoadingRate && (
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    <span>Fetching rate...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}