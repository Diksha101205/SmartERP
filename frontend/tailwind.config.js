/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#20242a',
        paper: '#f7f7f4',
        line: '#deded6',
        mint: '#4f8f74',
        gold: '#b9852b',
        berry: '#9a4662',
        steel: '#49627a'
      },
      boxShadow: {
        panel: '0 1px 2px rgba(32, 36, 42, 0.08)'
      }
    }
  },
  plugins: []
};
