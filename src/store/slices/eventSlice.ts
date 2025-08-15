import { StateCreator } from 'zustand';
import { Event, LiveSession } from '../../types';

export interface EventSlice {
  // State
  events: Event[];
  liveSessions: LiveSession[];
  
  // Event Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Live Session Actions
  setLiveSessions: (sessions: LiveSession[]) => void;
  addLiveSession: (session: LiveSession) => void;
  updateLiveSession: (id: string, updates: Partial<LiveSession>) => void;
  deleteLiveSession: (id: string) => void;
}

export const eventSlice: StateCreator<EventSlice> = (set, get) => ({
  // Initial state
  events: [],
  liveSessions: [],
  
  // Event Actions
  setEvents: (events) => set({ events }),
  
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events]
  })),
  
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map(event =>
      event.id === id ? { ...event, ...updates } : event
    )
  })),
  
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter(event => event.id !== id)
  })),
  
  // Live Session Actions
  setLiveSessions: (sessions) => set({ liveSessions: sessions }),
  
  addLiveSession: (session) => set((state) => ({
    liveSessions: [session, ...state.liveSessions]
  })),
  
  updateLiveSession: (id, updates) => set((state) => ({
    liveSessions: state.liveSessions.map(session =>
      session.id === id ? { ...session, ...updates } : session
    )
  })),
  
  deleteLiveSession: (id) => set((state) => ({
    liveSessions: state.liveSessions.filter(session => session.id !== id)
  })),
}); 