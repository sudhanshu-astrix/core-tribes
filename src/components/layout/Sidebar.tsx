import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Award, Settings, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { label: 'Home Feed', path: '/', icon: Home },
  { label: 'Communities', path: '/communities', icon: Users },
  { label: 'Events', path: '/live', icon: Calendar },
  { label: 'Games', path: '/home/games', icon: Gamepad2 },
  { label: 'Profile', path: '/profile', icon: Award },
  { label: 'Token Studio', path: '/tokens', icon: Award },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-[90vh] bg-[#FAFAFA] dark:bg-[#1A1A1A] border-r border-border dark:border-borderDark py-8 px-4 rounded-tr-xl rounded-br-xl shadow-card flex-shrink-0">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-colors duration-150',
                isActive(item.path)
                  ? 'bg-[#BBF10A] text-black shadow-card'
                  : 'text-black dark:text-white hover:bg-[#BBF10A]/10 hover:text-[#BBF10A]',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-base tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
              <div className="mt-auto pt-5 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg p-4">
          <h4 className="font-medium text-black dark:text-white mb-2">Create New</h4>
          <p className="text-sm text-gray-400 mb-3">
            Create a new community or token to get started!
          </p>
          <Link
            to="/communities/new"
            className="text-sm text-black dark:text-white hover:underline"
          >
            Create Community →
          </Link>
        </div>
      </div>
    </aside>
  );
}