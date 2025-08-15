import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useThemeStore } from './store/store';
import { useWalletStore } from './store/walletStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { WalletConnectModal } from './components/wallet/WalletConnectModal';
import { DemoDataControl } from './components/community/DemoDataControl';

import { HomePage } from './pages/HomePage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { TokenStudioPage } from './pages/TokenStudioPage';
import { LiveSessionsPage } from './pages/LiveSessionsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { CreateCommunityPage } from './pages/CreateCommunityPage';
import { SettingsPage } from './pages/SettingsPage';
import GovernancePage from './pages/GovernancePage';
import EventDetailsPage from './pages/events/[eventId]';

function App() {
  const { theme, customColors } = useThemeStore();
  const { isConnected, address, balance, getBalance } = useWalletStore();

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#111111' : '#EFEFEF'
      );
    }
  }, [theme]);

  // Initialize wallet balance on app startup if wallet is connected
  useEffect(() => {
    if (isConnected && address && !balance) {
      console.log('App: Initializing wallet balance on startup...');
      getBalance();
    }
  }, [isConnected, address, balance, getBalance]);

  return (
    <Router>
      <div className="min-h-screen bg-lightBg dark:bg-darkBg text-black dark:text-white">
        <Header />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-grow px-4 py-4 sm:py-8 pb-20 md:pb-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/communities/create" element={<CreateCommunityPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/community/:communityId" element={<CommunityDetailPage />} />
                <Route path="/community/:tribeId/event/create" element={<CreateEventPage />} />
                <Route path="/events/:eventId" element={<EventDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/create-profile" element={<CreateProfilePage />} />
                <Route path="/tokens" element={<TokenStudioPage />} />
                <Route path="/live/new" element={<CreateEventPage />} />
                <Route path="/live" element={<LiveSessionsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/home/games" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
        
        <BottomNav />
        <WalletConnectModal />
        {/* <DemoDataControl /> */}
      </div>
    </Router>
  );
}

export default App;