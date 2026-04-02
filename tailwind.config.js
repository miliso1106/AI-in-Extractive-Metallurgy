/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Dynamic severity badge colors (EnvironmentalImpact.jsx)
    {
      pattern: /bg-(red|orange|yellow|green)-(900|700)/,
      variants: [],
    },
    {
      pattern: /text-(red|orange|yellow|green)-(200|300)/,
    },
    {
      pattern: /border-(red|orange|yellow|green)-700/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        success: '#16a34a',
        warning: '#ea580c',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
}
