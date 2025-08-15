import { Link, useLocation } from 'react-router-dom';
import { Home, Users, User, Video, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/communities',
      icon: Users,
      label: 'Communities',
    },
    {
      path: '/live',
      icon: Video,
      label: 'Live',
    },
    {
      path: '/home/games',
      icon: Gamepad2,
      label: 'Games',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-lightBg/90 dark:bg-darkBg/90 border-t border-lightCard dark:border-darkCard">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'transition-colors duration-200',
                isActive
                  ? 'text-[#BBF10A] dark:text-[#BBF10A]'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-[#BBF10A] dark:text-[#BBF10A]')} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}