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
          primary: '#FAFBFC',   // Pearl White
          secondary: '#F3F4F6', // Soft Silver
          card: '#FFFFFF',      // Frost White
        },
        accent: {
          gold: '#D4AF37',      // Iron Gold
          goldLight: '#F5D060',
          blue: '#00B8FF',      // Arc Reactor Blue
          blueLight: '#80DCFF',
          red: '#E63946',       // Iron Red
          green: '#22C55E',     // Emerald Green
          amber: '#F59E0B',     // Amber
        },
        text: {
          primary: '#000000',   // Pure Black
          secondary: '#1F2937', // Charcoal Black (Replaced grey)
          muted: '#374151',     // Deep Slate Black (Replaced grey)
        },
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
        glass: '0 8px 32px 0 rgba(31, 41, 55, 0.06)',
        'glass-hover': '0 14px 40px 0 rgba(212, 175, 55, 0.15)',
        gold: '0 0 20px rgba(212, 175, 55, 0.25)',
        blue: '0 0 20px rgba(0, 184, 255, 0.25)',
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
          '0%, 100%': { transform: 'translateX(-20px) rotate(-5deg)' },
          '50%': { transform: 'translateX(20px) rotate(5deg)' },
        },
        workBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-3px) scale(1.05)' },
        },
        hammer: {
          '0%, 100%': { transform: 'rotate(-20deg)' },
          '50%': { transform: 'rotate(30deg)' },
        },
        wrench: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(45deg)' },
        },
        mop: {
          '0%, 100%': { transform: 'translateX(-5px) rotate(-10deg)' },
          '50%': { transform: 'translateX(5px) rotate(10deg)' },
        },
        lightning: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.6', filter: 'brightness(1.5)' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px #D4AF37)', opacity: '1' },
          '50%': { filter: 'drop-shadow(0 0 8px #D4AF37)', opacity: '0.8' },
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
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(0, 184, 255, 0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(0, 184, 255, 0.8))' },
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
