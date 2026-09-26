/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        background: {
          primary: '#F3F4F6',   // Pearl Gray Base
          secondary: '#FFFFFF', // White Surface
          deep: '#E5E7EB',
          card: 'rgba(255, 255, 255, 0.6)',      // Light Glass Card Base
          dark: '#F3F4F6',      // Replaced Dark with Pearl Gray
          cardSecondary: 'rgba(255, 255, 255, 0.75)',
          widget: 'rgba(239, 246, 255, 0.7)',    // Soft Ocean Blue Tint
        },
        accent: {
          main: '#2563EB',      // Primary Blue Accent
          bright: '#3B82F6',    // Bright Blue
          light: '#60A5FA',     // Soft Blue
          peach: '#DBEAFE',     // Light Ocean Blue Highlight
          highlight: '#2563EB',
          gold: '#2563EB',
          goldLight: '#3B82F6',
          orange: '#2563EB',    // Mapped orange references to primary blue
          red: '#EF4444',
          green: '#10B981',
          amber: '#F59E0B',
          blue: '#2563EB',
          blueLight: '#DBEAFE',
          blueSoft: '#BFDBFE',
        },
        text: {
          primary: '#111827',   // Primary Dark Text for Light Theme
          secondary: '#4B5563', // Secondary Text
          muted: '#6B7280',     // Muted Text
          disabled: '#9CA3AF',  // Disabled Text
        },
        border: {
          primary: 'rgba(37, 99, 235, 0.15)',   // Subtle Blue Glow Border
          orange: 'rgba(37, 99, 235, 0.25)',
          active: '#2563EB',
          glass: 'rgba(255, 255, 255, 0.4)',   // Light Glass Border
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-hover': '0 12px 40px 0 rgba(37, 99, 235, 0.08)',
        orange: '0 4px 20px rgba(37, 99, 235, 0.2)',
        bright: '0 6px 25px rgba(37, 99, 235, 0.3)',
        premium: '0 10px 40px rgba(31, 38, 135, 0.06)',
      },
      backdropBlur: {
        glass: '20px',
        premium: '30px',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-up-fade': 'slideUpFade 0.6s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'title-shimmer': 'titleShimmer 4s linear infinite',
      },
      keyframes: {
        titleShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px #2563EB)', opacity: '1' },
          '50%': { filter: 'drop-shadow(0 0 12px #2563EB)', opacity: '0.9' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', filter: 'drop-shadow(0 0 20px rgba(37, 99, 235, 0.2))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 40px rgba(37, 99, 235, 0.4))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
