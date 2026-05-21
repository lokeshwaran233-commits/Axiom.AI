/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        axiom: {
          bg: 'rgb(10 10 12)',
          'bg-secondary': 'rgb(18 18 22)',
          'bg-tertiary': 'rgb(24 24 30)',
          'bg-elevated': 'rgb(30 30 38)',
          border: 'rgb(40 40 50)',
          'border-secondary': 'rgb(50 50 62)',
          cyan: 'rgb(34 211 238)',
          emerald: 'rgb(52 211 153)',
          amber: 'rgb(251 191 36)',
          red: 'rgb(248 113 113)',
          blue: 'rgb(96 165 250)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
