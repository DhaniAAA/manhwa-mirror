/** @type {import('tailwindcss').Config} */
export default {
<<<<<<< HEAD
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
=======
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '1.25rem',
        lg: '2rem',
        xl: '2rem',
      },
    },
    extend: {
      colors: {
        background: {
          primary: '#0a0a0f',
          secondary: '#13131a',
          tertiary: '#1a1a24',
          elevated: '#20202e',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b4b4b8',
          muted: '#8a8a94',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        divider: 'rgba(255, 255, 255, 0.05)',
      },
      boxShadow: {
        ambient: '0 0 40px rgba(139, 92, 246, 0.15)',
        'sm-dark': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'lg-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        'xl-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        ambientFloat: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(2%, -2%) rotate(1deg)' },
          '66%': { transform: 'translate(-2%, 2%) rotate(-1deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        searchSlideIn: {
          from: { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fireFlicker: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        ambient: 'ambientFloat 20s ease-in-out infinite',
        fade: 'fadeIn 0.5s ease-out',
        slide: 'slideIn 0.5s ease-out',
        pulse: 'pulseGlow 1.5s ease-in-out infinite',
        'search-slide': 'searchSlideIn 0.3s ease-out',
        fire: 'fireFlicker 2s ease-in-out infinite',
        'fade-scale': 'fadeInScale 0.5s ease-out backwards',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        200: '200',
      },
>>>>>>> 55df43e16ee1a1ffed61a42e163f41533e501fb8
    },
  },
  plugins: [],
}
