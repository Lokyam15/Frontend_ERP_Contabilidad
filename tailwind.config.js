/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'erp-dark': '#0F172A',
        'erp-primary': '#4F46E5',
        'erp-primary-hover': '#4338CA',
        'erp-secondary': '#94A3B8',
        'erp-accent': '#10B981',
      }
    },
  },
  plugins: [],
}
