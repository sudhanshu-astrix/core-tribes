import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { WalletStore, Network, SUPPORTED_NETWORKS } from '@/types/wallet';
import { shortenAddress, formatBalance, isMetaMaskInstalled } from '@/lib/utils';

const DEFAULT_NETWORK = SUPPORTED_NETWORKS.xdc;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // State
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      isConnecting: false,
      error: null,

      // Actions
      connect: async () => {
        if (!isMetaMaskInstalled() || !window.ethereum) {
          set({ error: 'MetaMask is not installed. Please install MetaMask to continue.' });
          return;
        }

        set({ isConnecting: true, error: null });

        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Request account access
          const accounts = await provider.send('eth_requestAccounts', []);
          // ethers v6: get the address from the signer
          const signers = await provider.listAccounts();
          const address = signers[0]?.address;
          
          if (!address) {
            throw new Error('No accounts found');
          }

          // Get network info
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);

          // Get balance
          const balance = await provider.getBalance(address);
          const formattedBalance = formatBalance(balance.toString());

          set({
            isConnected: true,
            address,
            chainId,
            balance: formattedBalance,
            isConnecting: false,
            error: null,
          });

          // Listen for account changes
          window.ethereum!.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              get().disconnect();
            } else {
              set({ address: accounts[0] });
              get().getBalance();
            }
          });

          // Listen for chain changes
          window.ethereum!.on('chainChanged', (chainId: string) => {
            set({ chainId: parseInt(chainId, 16) });
            get().getBalance();
          });

        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({
            isConnecting: false,
            error: error instanceof Error ? error.message : 'Failed to connect wallet',
          });
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          address: null,
          chainId: null,
          balance: null,
          error: null,
        });
      },

      switchNetwork: async (chainId: number) => {
        if (!get().isConnected) {
          set({ error: 'Wallet not connected' });
          return;
        }

        try {
          if (!window.ethereum) {
            set({ error: 'MetaMask is not available' });
            return;
          }
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
            if (network) {
              await get().addNetwork(network);
            }
          } else {
            set({ error: 'Failed to switch network' });
          }
        }
      },

      addNetwork: async (network: Network) => {
        try {
          if (!window.ethereum) {
            set({ error: 'MetaMask is not available' });
            return;
          }
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${network.chainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorerUrl],
              },
            ],
          });
        } catch (error) {
          console.error('Failed to add network:', error);
          set({ error: 'Failed to add network to MetaMask' });
        }
      },

      getBalance: async () => {
        if (!get().isConnected || !get().address || !window.ethereum) return;

        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(get().address!);
          const formattedBalance = formatBalance(balance.toString());
          set({ balance: formattedBalance });
        } catch (error) {
          console.error('Failed to get balance:', error);
        }
      },

      initializeWallet: async () => {
        // Check if MetaMask is installed and connected
        if (!isMetaMaskInstalled()) {
          return;
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!);
          
          // Check if already connected
          const signers = await provider.listAccounts();
          const address = signers[0]?.address;
          if (address) {
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            
            // Get balance
            const balance = await provider.getBalance(address);
            const formattedBalance = formatBalance(balance.toString());

            set({
              isConnected: true,
              address,
              chainId,
              balance: formattedBalance,
              error: null,
            });

            // Set up event listeners
            window.ethereum!.on('accountsChanged', (accounts: string[]) => {
              if (accounts.length === 0) {
                get().disconnect();
              } else {
                set({ address: accounts[0] });
                get().getBalance();
              }
            });

            window.ethereum!.on('chainChanged', (chainId: string) => {
              set({ chainId: parseInt(chainId, 16) });
              get().getBalance();
            });

            console.log('Wallet automatically connected on initialization');
          }
        } catch (error) {
          console.error('Failed to initialize wallet:', error);
        }
      },
    }),
    {
      name: 'tribes-wallet-store',
      partialize: (state) => ({
        // Only persist connection state, not sensitive data
        isConnected: state.isConnected,
        address: state.address,
        chainId: state.chainId,
      }),
    }
  )
); 