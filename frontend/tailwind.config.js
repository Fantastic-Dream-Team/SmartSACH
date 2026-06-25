/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'green-sach': {
          900: '#1b4332',
          700: '#2d6a4f',
          100: '#d8f3dc',
          mid: '#95d5b2',
        },
        'blue-sach': '#2a4f92',
      },
    },
  },
  plugins: [],
}
