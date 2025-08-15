import { useState, useEffect } from 'react';
import { Crown, Loader2, CheckCircle, AlertCircle, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { roleManagerService, ROLE_CONSTANTS } from '../../services/RoleManager';
import { useWalletStore } from '../../store/walletStore';

interface BecomeOrganizerProps {
  onRoleGranted?: () => void;
  showButton?: boolean;
}

export function BecomeOrganizer({ onRoleGranted, showButton = true }: BecomeOrganizerProps) {
  const { address } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isBecomingOrganizer, setIsBecomingOrganizer] = useState(false);
  const [hasOrganizerRole, setHasOrganizerRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has organizer role
  useEffect(() => {
    const checkOrganizerRole = async () => {
      if (!address) return;

      try {
        setIsChecking(true);
        setError(null);
        
        await roleManagerService.initialize();
        const isOrganizer = await roleManagerService.isOrganizer(address);
        setHasOrganizerRole(isOrganizer);
      } catch (error) {
        console.error('Failed to check organizer role:', error);
        setError('Failed to check organizer status');
      } finally {
        setIsChecking(false);
      }
    };

    checkOrganizerRole();
  }, [address]);

  const handleBecomeOrganizer = async () => {
    if (!address) {
      alert('Please connect your wallet to become an organizer');
      return;
    }

    try {
      setIsBecomingOrganizer(true);
      setError(null);

      await roleManagerService.initialize();
      
      // Assign the organizer role using the correct role constant
      await roleManagerService.assignRole(address, ROLE_CONSTANTS.ORGANIZER_ROLE);
      
      setHasOrganizerRole(true);
      setIsOpen(false);
      
      if (onRoleGranted) {
        onRoleGranted();
      }
      
      alert('Successfully became an organizer! You can now create events.');
    } catch (error) {
      console.error('Failed to become organizer:', error);
      setError('Failed to become organizer. You may not have permission or the transaction failed.');
    } finally {
      setIsBecomingOrganizer(false);
    }
  };

  if (!showButton) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-[#BBF10A] mr-2" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Checking organizer status...
        </span>
      </div>
    );
  }

  if (hasOrganizerRole) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Organizer</span>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#1A1A1A] text-white border border-gray-600 hover:bg-[#2A2A2A]"
        className="group hover:bg-accentBlue/90 transition-all duration-200 hover:scale-105"
      >
        <Crown className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
        Become Organizer
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="bg-lightCard dark:bg-darkCard rounded-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-black" />
            </div>
            
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
              Become an Organizer
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To create events, you need to have the Organizer role. This allows you to:
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#BBF10A]" />
                <span className="text-sm text-black dark:text-white">Create and manage events</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-[#BBF10A]" />
                <span className="text-sm text-black dark:text-white">Manage event tickets and attendees</span>
              </div>
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-[#BBF10A]" />
                <span className="text-sm text-black dark:text-white">Approve ticket requests for private events</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isBecomingOrganizer}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleBecomeOrganizer}
                disabled={isBecomingOrganizer}
                className="flex-1 group transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#BBF10A', color: '#000000', border: 'none', borderRadius: 12 }}
              >
                {isBecomingOrganizer ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Becoming Organizer...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Become Organizer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
} 