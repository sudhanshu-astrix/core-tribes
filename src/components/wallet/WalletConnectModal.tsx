import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUserStore } from '../../store/store';
import { mockUser } from '../../data/mockData';

// Mock wallet providers
const walletProviders = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: 'https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'https://cdn.iconscout.com/icon/free/png-256/free-coinbase-8-1175044.png',
  },
];

export function WalletConnectModal() {
  const { isWalletModalOpen, setWalletModalOpen, connectWallet } = useUserStore();

  const handleConnectWallet = (providerId: string) => {
    // In a real app, this would connect to the actual wallet
    // Don't automatically set user data - let components handle this when needed
    setTimeout(() => {
      // Just close the modal, don't set user data
      setWalletModalOpen(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setWalletModalOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-lightBg dark:bg-darkBg border border-lightCard dark:border-darkCard rounded-xl shadow-lg w-full max-w-md overflow-hidden z-10"
          >
            <div className="flex items-center justify-between p-4 border-b border-lightCard dark:border-darkCard">
              <h2 className="text-xl font-semibold text-black dark:text-white">Connect Your Digital Wallet</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-lightCard dark:hover:bg-darkCard"
              >
                <X className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your wallet is your key to joining communities and managing your digital items on Tribes. It keeps your identity and assets secure.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose a provider to connect. New to wallets? 
                <a href="/what-is-a-wallet" target="_blank" rel="noopener noreferrer" className="text-[#BBF10A] dark:text-[#BBF10A] hover:underline">
                  Learn more here
                </a>.
              </p>
              
              <div className="space-y-3 pt-2">
                {walletProviders.map((provider) => (
                  <motion.button
                    key={provider.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnectWallet(provider.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-lightCard dark:border-darkCard bg-lightCard dark:bg-darkCard hover:bg-lightCardHover dark:hover:bg-darkCardHover transition-colors"
                  >
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-black dark:text-white font-medium">{provider.name}</span>
                  </motion.button>
                ))}
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-6">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}