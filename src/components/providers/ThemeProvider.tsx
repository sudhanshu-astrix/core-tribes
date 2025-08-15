'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../../store/store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, customColors } = useThemeStore();

  useEffect(() => {
    // Apply theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply custom colors
    document.documentElement.style.setProperty('--primary-color', customColors.primary);
    document.documentElement.style.setProperty('--secondary-color', customColors.secondary);
    document.documentElement.style.setProperty('--accent-color', customColors.accent);
    
    // Generate lighter and darker variants
    const lightenColor = (color: string, percent: number): string => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    const darkenColor = (color: string, percent: number): string => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    };

    document.documentElement.style.setProperty('--accent-light', lightenColor(customColors.accent, 20));
    document.documentElement.style.setProperty('--accent-dark', darkenColor(customColors.accent, 20));

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#111111' : '#EFEFEF'
      );
    }
  }, [theme, customColors]);

  return <>{children}</>;
} 