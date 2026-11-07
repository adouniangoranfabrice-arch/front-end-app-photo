/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // CSS-variable driven — values flip between light & dark mode
        ink: {
          50: 'rgb(var(--ink-50))',
          100: 'rgb(var(--ink-100))',
          200: 'rgb(var(--ink-200))',
          300: 'rgb(var(--ink-300))',
          400: 'rgb(var(--ink-400))',
          500: 'rgb(var(--ink-500))',
          600: 'rgb(var(--ink-600))',
          700: 'rgb(var(--ink-700))',
          800: 'rgb(var(--ink-800))',
          900: 'rgb(var(--ink-900))',
          950: 'rgb(var(--ink-950))',
        },
        // overlay = black in dark mode, white in light mode (for /opacity utilities)
        overlay: {
          DEFAULT: 'rgb(var(--overlay))',
          50: 'rgb(var(--overlay))',
          100: 'rgb(var(--overlay))',
          200: 'rgb(var(--overlay))',
          300: 'rgb(var(--overlay))',
          400: 'rgb(var(--overlay))',
          500: 'rgb(var(--overlay))',
          600: 'rgb(var(--overlay))',
          700: 'rgb(var(--overlay))',
          800: 'rgb(var(--overlay))',
          900: 'rgb(var(--overlay))',
          950: 'rgb(var(--overlay))',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        'fade-up': 'fadeInUp 0.8s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scan': 'scanline 2s ease-in-out infinite',
        'scroll-down': 'scrollDown 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)' },
        },
        scanline: {
          '0%': { top: '0', opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
