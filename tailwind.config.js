/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        card: 'rgb(var(--card-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
