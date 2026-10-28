/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        cinema: {
          950: '#07080d',
          900: '#0d1017',
          800: '#161b26',
          700: '#222938',
          red: '#e50914',
          redGlow: '#ff1e27',
          gold: '#f59e0b',
          goldLight: '#fbbf24'
        },
        admin: {
          950: '#090d16',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          crimson: '#e11d48',
          amber: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
