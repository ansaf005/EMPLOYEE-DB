/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Monochromatic grayscale theme tokens
        border: {
          light: '#e2e8f0',
          dark: '#1e293b',
        },
        accent: {
          light: '#f1f5f9',
          dark: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'glow-dark': '0 0 20px rgba(255, 255, 255, 0.03)',
      }
    },
  },
  plugins: [],
}
