/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'verde-mid': '#22c55e',
        'verde-oscuro': '#15803d',
      }
    },
  },
  plugins: [],
}