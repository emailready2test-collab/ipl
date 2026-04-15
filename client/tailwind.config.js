/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0D1B3E', 50: '#1a2d5a', 100: '#152448', 200: '#0D1B3E', dark: '#060e20' },
        gold: { DEFAULT: '#D4A017', light: '#F5C518', dark: '#A07810' },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        flash: { '0%': { backgroundColor: 'rgba(212,160,23,0.45)' }, '100%': { backgroundColor: 'transparent' } },
        'slide-up': { '0%': { transform: 'translateY(16px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        'pulse-dot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
      animation: {
        flash: 'flash 1.8s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
