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
          primary: '#F7F9FC',   // Base Light Gray
          secondary: '#FFFFFF', // White Surface
          deep: '#F0F2F5',
          card: 'rgba(255, 255, 255, 0.65)',      // Liquid Glass Card
          cardSecondary: 'rgba(255, 255, 255, 0.80)',
          widget: 'rgba(255, 241, 230, 0.5)',    // Light Orange Glass Tint
        },
        accent: {
          main: '#FF7A18',      // Medium Orange Accent
          orange: '#FF7A18',
          orangeLight: '#FFF1E6',
          orangeSoft: '#FFDCC4',
          bright: '#FF6A00',    // Vibrant Orange for Fluid Light/Glow
          light: '#FFD1B3',
          peach: '#FFF1E6',
          highlight: '#FF8A3D',
          gold: '#FF7A18',
          goldLight: '#FFD1B3',
          black: '#111111',     // Professional Black
          charcoal: '#1C1C1E',  // Dark Charcoal
          charcoalLight: '#2C2C2E',
          red: '#EF4444',
          green: '#10B981',
          amber: '#F59E0B',
          blue: '#FF7A18',      // Fallback redirect blue to orange
          blueLight: '#FFF1E6',
          blueSoft: '#FFDCC4',
        },
        text: {
          primary: '#111111',   // Professional Black Text
          secondary: '#1C1C1E', // Dark Charcoal Secondary Text
          muted: '#6B7280',     // Muted Gray
          disabled: '#9CA3AF',  // Disabled Text
        },
        border: {
          primary: 'rgba(255, 122, 24, 0.20)',   // Soft Orange Glow Border
          orange: 'rgba(255, 122, 24, 0.35)',
          active: '#FF7A18',
          glass: 'rgba(255, 255, 255, 0.75)',    // Light Glass Border
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
        glass: '0 20px 50px rgba(31,38,135,0.06), 0 8px 25px rgba(255,120,30,0.08), inset 0 1px 2px rgba(255,255,255,0.9)',
        'glass-hover': '0 20px 50px rgba(255,120,30,0.12), 0 8px 25px rgba(0,0,0,0.05), inset 0 1px 3px rgba(255,255,255,1)',
        orange: '0 10px 25px rgba(255, 122, 24, 0.25)',
        bright: '0 10px 30px rgba(255, 106, 0, 0.30)',
        black: '0 10px 25px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.2)',
        premium: '0 20px 50px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.8)',
      },
      backdropBlur: {
        glass: '25px',
        premium: '35px',
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
          '0%, 100%': { filter: 'drop-shadow(0 0 2px #FF7A18)', opacity: '1' },
          '50%': { filter: 'drop-shadow(0 0 12px #FF7A18)', opacity: '0.9' },
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
          '0%, 100%': { opacity: '0.3', filter: 'drop-shadow(0 0 20px rgba(255, 122, 24, 0.2))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 40px rgba(255, 122, 24, 0.4))' },
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
