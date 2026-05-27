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
          navy: '#0f172a',
          emerald: '#10b981',
          blue: '#3b82f6',
          slate: '#1e293b',
          light: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}


