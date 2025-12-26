import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00F5FF',
          50: '#E0FEFF',
          100: '#B3FDFF',
          200: '#80FBFF',
          300: '#4DF9FF',
          400: '#1AF7FF',
          500: '#00F5FF',
          600: '#00C4CC',
          700: '#009399',
          800: '#006266',
          900: '#003133',
        },
        secondary: {
          DEFAULT: '#FF00E5',
          500: '#FF00E5',
        },
        accent: {
          DEFAULT: '#00FF88',
          500: '#00FF88',
        },
        arena: {
          DEFAULT: '#1a472a',
          dark: '#0f2d1a',
          light: '#2d5a3d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 245, 255, 0.5)',
        'neon-lg': '0 0 40px rgba(0, 245, 255, 0.6)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
