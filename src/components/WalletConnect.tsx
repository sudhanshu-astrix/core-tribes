'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore } from '@/store/store';
import { SUPPORTED_NETWORKS } from '@/types/wallet';
import { shortenAddress, getNetworkName } from '@/lib/utils';
import { ChevronDown, Wallet, LogOut, Copy, Check } from 'lucide-react';
import { mockUser } from '@/data/mockData';

export const WalletConnect: React.FC = () => {
  const { isConnected, address, chainId, balance, isConnecting, connect, disconnect, switchNetwork } = useWalletStore();
  const { connectWallet: connectUserWallet, disconnectWallet: disconnectUserWallet, user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync wallet state with user store
  useEffect(() => {
    if (!isConnected && user && typeof user === 'object' && 'id' in user) {
      // Wallet is disconnected but user store still has user data
      disconnectUserWallet();
    }
  }, [isConnected, user, disconnectUserWallet]);

  const handleConnect = async () => {
    await connect();
    // Don't automatically set user data - let components handle this when needed
  };

  const handleDisconnect = () => {
    disconnect();
    disconnectUserWallet();
    setShowDropdown(false);
  };

  const handleNetworkSwitch = async (chainId: number) => {
    await switchNetwork(chainId);
    setShowDropdown(false);
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        loading={isConnecting}
        className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-[#2A2A2A] font-semibold transition-all duration-200"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 min-w-[200px] justify-between hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm">{shortenAddress(address!)}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-6">
            {/* Wallet Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Connected Wallet</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Connected</span>
                </div>
              </div>
              <div className="relative">
                <div 
                  className="font-mono text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg pr-12 break-all cursor-default"
                  title={address || ''}
                >
                  {address}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">Balance</span>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {balance} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{chainId !== null ? getNetworkName(chainId) : 'Unknown'}</span>
              </div>
            </div>

            {/* Network Selection */}
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 block">Network</span>
              <div className="space-y-2">
                {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                  <button
                    key={key}
                    onClick={() => handleNetworkSwitch(network.chainId)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] ${
                      chainId === network.chainId
                        ? 'bg-gradient-to-r from-[#BBF10A]/20 to-[#BBF10A]/30 dark:from-[#BBF10A]/20 dark:to-[#BBF10A]/30 text-[#BBF10A] dark:text-[#BBF10A] border border-[#BBF10A]/30 dark:border-[#BBF10A]/30 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          chainId === network.chainId 
                            ? 'bg-[#BBF10A] shadow-lg shadow-[#BBF10A]/50' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}></div>
                        <span className="font-medium">{network.name}</span>
                      </div>
                      {chainId === network.chainId && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-[#BBF10A] rounded-full animate-pulse"></div>
                                                      <span className="text-xs text-[#BBF10A] dark:text-[#BBF10A] font-medium">Active</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}; 