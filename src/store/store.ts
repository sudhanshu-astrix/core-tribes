import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userSlice, UserSlice } from './slices/userSlice';
import { themeSlice, ThemeSlice } from './slices/themeSlice';
import { tribeSlice, TribeSlice } from './slices/tribeSlice';
import { eventSlice, EventSlice } from './slices/eventSlice';
import { activitySlice, ActivitySlice } from './slices/activitySlice';

// Combined store type
export type Store = UserSlice & ThemeSlice & TribeSlice & EventSlice & ActivitySlice;

// Create the main store
export const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...userSlice(...a),
      ...themeSlice(...a),
      ...tribeSlice(...a),
      ...eventSlice(...a),
      ...activitySlice(...a),
    }),
    {
      name: 'tribes-store',
      partialize: (state) => ({
        // Persist theme and user data
        theme: state.theme,
        customColors: state.customColors,
        user: state.user,
        isWalletConnected: state.isWalletConnected,
      }),
    }
  )
);

// Export individual hooks for better performance
export const useUserStore = () => useStore((state) => ({
  user: state.user,
  isWalletConnected: state.isWalletConnected,
  isWalletModalOpen: state.isWalletModalOpen,
  connectWallet: state.connectWallet,
  disconnectWallet: state.disconnectWallet,
  setWalletModalOpen: state.setWalletModalOpen,
  updateUser: state.updateUser,
}));

export const useThemeStore = () => useStore((state) => ({
  theme: state.theme,
  customColors: state.customColors,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setCustomColors: state.setCustomColors,
  resetColors: state.resetColors,
}));

export const useTribeStore = () => useStore((state) => ({
  communities: state.communities,
  currentCommunity: state.currentCommunity,
  communityMembers: state.communityMembers,
  posts: state.posts,
  proposals: state.proposals,
  polls: state.polls,
  governance: state.governance,
  // Actions
  setCommunities: state.setCommunities,
  addCommunity: state.addCommunity,
  updateCommunity: state.updateCommunity,
  deleteCommunity: state.deleteCommunity,
  setCurrentCommunity: state.setCurrentCommunity,
  setPosts: state.setPosts,
  addPost: state.addPost,
  updatePost: state.updatePost,
  deletePost: state.deletePost,
  setProposals: state.setProposals,
  addProposal: state.addProposal,
  updateProposal: state.updateProposal,
  deleteProposal: state.deleteProposal,
  setPolls: state.setPolls,
  addPoll: state.addPoll,
  updatePoll: state.updatePoll,
  deletePoll: state.deletePoll,
  setGovernance: state.setGovernance,
  addGovernance: state.addGovernance,
  updateGovernance: state.updateGovernance,
  deleteGovernance: state.deleteGovernance,
  setCommunityMembers: state.setCommunityMembers,
  addCommunityMember: state.addCommunityMember,
  updateCommunityMember: state.updateCommunityMember,
  removeCommunityMember: state.removeCommunityMember,
}));

export const useEventStore = () => useStore((state) => ({
  events: state.events,
  liveSessions: state.liveSessions,
  // Actions
  setEvents: state.setEvents,
  addEvent: state.addEvent,
  updateEvent: state.updateEvent,
  deleteEvent: state.deleteEvent,
  setLiveSessions: state.setLiveSessions,
  addLiveSession: state.addLiveSession,
  updateLiveSession: state.updateLiveSession,
  deleteLiveSession: state.deleteLiveSession,
}));

export const useActivityStore = () => useStore((state) => ({
  activities: state.activities,
  notifications: state.notifications,
  // Actions
  setActivities: state.setActivities,
  addActivity: state.addActivity,
  updateActivity: state.updateActivity,
  deleteActivity: state.deleteActivity,
  setNotifications: state.setNotifications,
  addNotification: state.addNotification,
  updateNotification: state.updateNotification,
  deleteNotification: state.deleteNotification,
  markNotificationAsRead: state.markNotificationAsRead,
  markAllNotificationsAsRead: state.markAllNotificationsAsRead,
})); 