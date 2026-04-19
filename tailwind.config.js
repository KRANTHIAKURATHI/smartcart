/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc7ff',
          400: '#38a9ff',
          500: '#2874f0', // Flipkart Blue
          600: '#0056e0',
          700: '#0044b3',
          800: '#00338a',
          900: '#002661',
        },
        accent: {
          400: '#ff9f00', // Amazon Yellow
          500: '#fb641b', // Flipkart Orange
        },
        surface: {
          50: '#f1f3f6', // Amazon/Flipkart Light Grey BG
          100: '#eef0f3',
          200: '#e0e2e5',
          300: '#d1d3d6',
          400: '#a1a3a6',
          500: '#878787', // Medium Grey
          600: '#666666',
          700: '#4a4a4a', // Dark Grey
          800: '#333333',
          900: '#212121',
          950: '#1a1a1a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 2px 4px 0 rgba(0,0,0,.08)',
        'card-hover': '0 12px 24px 0 rgba(0,0,0,.15)',
        'nav': '0 1px 2px 0 rgba(0,0,0,.1)',
      }
    },
  },
  plugins: [],
}
