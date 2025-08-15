/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter Tight', 'Noto Sans Display', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'inter': ['Inter Tight', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'noto': ['Noto Sans Display', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom background colors
        lightBg: '#EFEFEF',
        darkBg: '#111111',
        
        // Custom text colors
        lightText: '#000000',
        darkText: '#FFFFFF',
        lightTextSecondary: '#6B7280',
        darkTextSecondary: '#9CA3AF',
        
        // Custom card colors
        lightCard: '#FAFAFA',
        darkCard: '#1A1A1A',
        lightCardHover: '#F5F5F5',
        darkCardHover: '#2A2A2A',
        
        // Custom accent colors
        brightYellow: '#BBF10A',
        neonBlue: '#3B82F6',
        primary: '#BBF10A', // Using new lime green color as primary
        
        // New improved accent colors for better visibility
        accentBlue: '#2563EB', // Blue accent for better contrast
        accentGreen: '#059669', // Green accent for better contrast
        accentPurple: '#7C3AED', // Purple accent for better contrast
        
        // Status colors
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        
        // Border colors
        border: '#E5E7EB',
        borderDark: '#374151',
        
        // Legacy color system (keeping for compatibility)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
      },
      boxShadow: {
        'modal': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-from-top-2': 'slideInFromTop2 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromTop2: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-8px) scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};