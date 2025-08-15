import { StateCreator } from 'zustand';
import { User } from '../../types';
import { awardXP } from '../../services/CommunityXPService';

export interface UserSlice {
  // State
  user: User | null | {};
  isWalletConnected: boolean;
  isWalletModalOpen: boolean;
  
  // Actions
  connectWallet: (user: User) => void;
  disconnectWallet: () => void;
  setWalletModalOpen: (isOpen: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const userSlice: StateCreator<UserSlice> = (set, get) => ({
  // Initial state
  user: {}, // Start with empty object instead of null
  isWalletConnected: false,
  isWalletModalOpen: false,
  
  // Actions
  connectWallet: (user) => {
    // Only award XP if user has communities and is a valid User object
    if (user && typeof user === 'object' && 'id' in user && 'communities' in user && user.communities.length > 0) {
      const xpResult = awardXP(user.id, user.communities[0], 'postCreation');
      if (xpResult.success) {
        console.log(`Daily login: +${xpResult.xpAwarded} XP`);
      } else if (xpResult.reason === 'cooldown') {
        console.log('Daily login cooldown.');
      } else {
        console.log('Could not award XP for daily login.');
      }
    }
    set({ user, isWalletConnected: true, isWalletModalOpen: false });
  },
  
  disconnectWallet: () => set({ user: {}, isWalletConnected: false }),
  
  setWalletModalOpen: (isOpen) => set({ isWalletModalOpen: isOpen }),
  
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser && typeof currentUser === 'object' && 'id' in currentUser) {
      set({ user: { ...currentUser, ...updates } });
    } else {
      // If user is empty object or null, create a new user with updates
      set({ user: updates as User });
    }
  },
}); 