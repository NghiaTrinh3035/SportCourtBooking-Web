/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0d9488',
          strong: '#0f766e',
          light: '#ccfbf1',
          muted: '#5eead4',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#e0e7ff',
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      animation: {
        'fade-in': 'fadeSlideIn 480ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'scale-in': 'scaleIn 360ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-down': 'slideDown 320ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'slide-in-left': 'slideInLeft 350ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'float': 'float 6s ease-in-out infinite',
        'shake': 'shake 500ms ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(15, 23, 42, 0.07), 0 2px 8px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 20px 48px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'float': '0 24px 56px rgba(15, 23, 42, 0.14)',
        'glow-brand': '0 0 20px rgba(13, 148, 136, 0.25)',
        'glow-accent': '0 0 20px rgba(99, 102, 241, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}