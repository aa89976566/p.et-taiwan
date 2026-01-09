/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFD93D',
        dark: '#2C3E50',
        light: '#F7F9FC'
      },
      fontFamily: {
        'sans': ['Nunito', 'Noto Sans TC', 'sans-serif']
      }
    },
  },
  plugins: [],
}
