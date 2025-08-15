import { StateCreator } from 'zustand';

export interface Activity {
  id: string;
  type: 'post' | 'comment' | 'reaction' | 'event' | 'proposal' | 'vote' | 'join' | 'level_up';
  title: string;
  description: string;
  userId: string;
  communityId?: string;
  targetId?: string; // ID of the post, event, etc.
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface ActivitySlice {
  // State
  activities: Activity[];
  notifications: Notification[];
  
  // Activity Actions
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  // Notification Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export const activitySlice: StateCreator<ActivitySlice> = (set, get) => ({
  // Initial state
  activities: [],
  notifications: [],
  
  // Activity Actions
  setActivities: (activities) => set({ activities }),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities]
  })),
  
  updateActivity: (id, updates) => set((state) => ({
    activities: state.activities.map(activity =>
      activity.id === id ? { ...activity, ...updates } : activity
    )
  })),
  
  deleteActivity: (id) => set((state) => ({
    activities: state.activities.filter(activity => activity.id !== id)
  })),
  
  // Notification Actions
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  updateNotification: (id, updates) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    )
  })),
  
  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    )
  })),
  
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({
      ...notification,
      isRead: true
    }))
  })),
}); 