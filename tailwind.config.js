/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'explode': 'explode 1.5s ease-out forwards',
        'pulse': 'pulse 1s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        explode: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(50)', opacity: '0.5' },
          '100%': { transform: 'scale(100)', opacity: '0' },
        },
        pulse: {
          '0%': { opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}