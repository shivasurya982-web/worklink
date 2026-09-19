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
          primary: '#FF651E',   // Primary Orange (rgb(255, 101, 30))
          secondary: '#E65410', // Deep Orange
          deep: '#CC4800',      // Dark Orange
          card: '#080808',      // Black/Dark Card
          dark: '#0D0D0D',      // Near Black
          cardSecondary: '#15110E', // Dark Charcoal
          widget: '#241208',    // Dark Orange Card
        },
        accent: {
          main: '#FF651E',      // Main Orange
          bright: '#FF7A2E',    // Bright Orange
          light: '#FF9A66',     // Light Orange
          peach: '#FFD0A8',     // Soft Peach
          highlight: '#FF651E', // Pure Orange Highlight
          gold: '#FF651E',      // Alias for main orange
          goldLight: '#FF7A2E', // Alias for bright orange
          orange: '#FF651E',    // Primary orange
          red: '#EF4444',       // Error Red
          green: '#22C55E',     // Success Green
          amber: '#FF9800',     // Warning Orange
        },
        text: {
          primary: '#FFF7F0',   // Warm White
          secondary: '#F3D5C0', // Soft Peach/Cream
          muted: '#C9A58E',     // Muted Brownish Orange
        },
        border: {
          primary: '#8F3208',   // Muted Orange Border
          orange: '#FF651E',    // Strong Orange Border
          active: '#FF651E',    // Bright Active Border
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 14px 40px 0 rgba(255, 101, 30, 0.18)',
        orange: '0 0 20px rgba(255, 101, 30, 0.25)',
        bright: '0 0 25px rgba(255, 101, 30, 0.3)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up-fade': 'slideUpFade 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'title-shimmer': 'titleShimmer 3s linear infinite',
      },
      keyframes: {
        titleShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px #FF651E)', opacity: '1' },
          '50%': { filter: 'drop-shadow(0 0 8px #FF651E)', opacity: '0.8' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(255, 101, 30, 0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(255, 101, 30, 0.8))' },
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
