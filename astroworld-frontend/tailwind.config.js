/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          // Main gradient palette
          'deep': '#00357a',
          'royal': '#4a4695',
          'violet': '#7d58ad',
          'magenta': '#af6ac1',
          'pink': '#e17cd3',
          'bright': '#ff91e1',
          // Shades palette
          'blue-dark': '#00357a',
          'blue': '#3d58a2',
          'blue-light': '#697dcd',
          'blue-lighter': '#94a5f8',
          'blue-lightest': '#bfcfff',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'space-mono': ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #00357a 0%, #4a4695 25%, #7d58ad 50%, #af6ac1 75%, #e17cd3 100%)',
        'space-gradient-reverse': 'linear-gradient(315deg, #00357a 0%, #4a4695 25%, #7d58ad 50%, #af6ac1 75%, #e17cd3 100%)',
      }
    },
  },
  plugins: [],
}