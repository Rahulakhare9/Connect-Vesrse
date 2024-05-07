/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./dist/**/*.{ejs,js}'], // Update the path to your source files if necessary
  darkMode: 'class', // or 'media' depending on your preference
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss'), require('autoprefixer')],
};
