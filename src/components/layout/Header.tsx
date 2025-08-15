'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from '@/components/WalletConnect';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useThemeStore } from '@/store/store';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme } = useThemeStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Communities', href: '/communities' },
    { name: 'Live Sessions', href: '/live' },
    { name: 'Governance', href: '/governance' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
            <header className="bg-[#EFEFEF] dark:bg-[#111111] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {/*
              Dynamically change logo image based on theme.
              Light: https://astrixcloud.blob.core.windows.net/astrix/sudhanshu/collectibles/9223817af437cde8aba2/collectibleCount1.png
              Dark:  https://astrixcloud.blob.core.windows.net/astrix/sudhanshu/collectibles/e4cd643d9cf9e446752f/collectibleCount1.png
            */}
            <Link to="/" className="flex items-center">
              <img
                src={
                  theme === 'dark'
                    ? "https://astrixcloud.blob.core.windows.net/astrix/sudhanshu/collectibles/e4cd643d9cf9e446752f/collectibleCount1.png"
                    : "https://astrixcloud.blob.core.windows.net/astrix/sudhanshu/collectibles/9223817af437cde8aba2/collectibleCount1.png"
                }
                className="w-28 h-28 object-contain"
                alt="logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-black dark:text-white hover:text-[#BBF10A] px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <WalletConnect />
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                              className="md:hidden p-2 rounded-md text-black dark:text-white hover:text-[#BBF10A]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-black dark:text-white hover:text-[#BBF10A] block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};