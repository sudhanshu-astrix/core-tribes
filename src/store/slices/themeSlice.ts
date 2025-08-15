import { StateCreator } from 'zustand';

export interface ThemeSlice {
  // State
  theme: 'dark' | 'light';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setCustomColors: (colors: Partial<ThemeSlice['customColors']>) => void;
  resetColors: () => void;
}

  const defaultColors = {
    primary: '#BBF10A',
    secondary: '#7A7A8C',
    accent: '#BBF10A', // Using the new lime green color for better visibility
  };

// Helper functions for color manipulation
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}

// Function to apply theme to document
const applyThemeToDocument = (theme: 'dark' | 'light', colors: typeof defaultColors) => {
  if (typeof document === 'undefined') return;
  
  // Apply theme class
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply custom colors
  document.documentElement.style.setProperty('--primary-color', colors.primary);
  document.documentElement.style.setProperty('--secondary-color', colors.secondary);
  document.documentElement.style.setProperty('--accent-color', colors.accent);
  
  // Generate lighter and darker variants
  const accentColor = colors.accent;
  document.documentElement.style.setProperty('--accent-light', lightenColor(accentColor, 20));
  document.documentElement.style.setProperty('--accent-dark', darkenColor(accentColor, 20));
};

export const themeSlice: StateCreator<ThemeSlice> = (set, get) => ({
  // Initial state
  theme: 'light', // Start with light theme
  customColors: defaultColors,
  
  // Actions
  setTheme: (theme) => {
    set({ theme });
    applyThemeToDocument(theme, get().customColors);
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    applyThemeToDocument(newTheme, get().customColors);
  },
  
  setCustomColors: (colors) => {
    const newColors = { ...get().customColors, ...colors };
    set({ customColors: newColors });
    applyThemeToDocument(get().theme, newColors);
  },
  
  resetColors: () => {
    set({ customColors: defaultColors });
    applyThemeToDocument(get().theme, defaultColors);
  },
}); 