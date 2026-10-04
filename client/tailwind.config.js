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
          primary: '#F8FAFC',   // Base Slate 50
          secondary: '#FFFFFF', // Pure White Surface
          deep: '#F1F5F9',      // Section Slate 100
          dark: '#0F172A',      // Dark Slate 900
          card: '#FFFFFF',
          cardSecondary: '#F8FAFC',
          widget: '#FFF7ED',
        },
        accent: {
          main: '#F97316',      // Primary Orange 500
          primary: '#F97316',
          hover: '#EA580C',     // Orange 600
          brand: '#F97316',
          light: '#FFF7ED',     // Orange 50
          soft: '#FFEDD5',      // Orange 100
          secondary: '#F97316', // Orange 500
          gold: '#F97316',
          orange: '#F97316',
          blue: '#F97316',
          indigo: '#F97316',
          black: '#0F172A',     // Slate 900
          charcoal: '#1E293B',  // Slate 800
          charcoalLight: '#334155',
          red: '#EF4444',
          green: '#10B981',
          amber: '#F59E0B',
        },
        text: {
          primary: '#0F172A',   // Slate 900
          secondary: '#334155', // Slate 700
          muted: '#64748B',     // Slate 500
          disabled: '#94A3B8',  // Slate 400
        },
        border: {
          primary: '#E2E8F0',   // Slate 200
          subtle: '#F1F5F9',    // Slate 100
          active: '#F97316',    // Orange 500
          glass: '#E2E8F0',
          orange: '#FFEDD5',
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.08)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 10px 20px -3px rgba(249, 115, 22, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'slide-up-fade': 'slideUpFade 0.4s ease-out forwards',
      },
      keyframes: {
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
