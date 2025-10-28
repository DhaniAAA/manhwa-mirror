/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#13131a',
        'bg-tertiary': '#1a1a24',
        'bg-elevated': '#20202e',
        'text-primary': '#ffffff',
        'text-secondary': '#b4b4b8',
        'text-muted': '#6b7280',
        'accent-primary': '#8b5cf6',
        'accent-secondary': '#a855f7',
        'border-color': '#2a2a3a',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'gradient-shift': 'gradient-shift 10s ease-in-out infinite',
        'fire-flicker': 'fire-flicker 2s ease-in-out infinite',
        'fade-in-scale': 'fade-in-scale 0.5s ease-out backwards',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' }
        },
        'gradient-shift': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'fire-flicker': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        'fade-in-scale': {
          from: {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          to: {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
      }
    },
  },
  plugins: [],
}
