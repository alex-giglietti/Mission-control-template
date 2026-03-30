/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        magenta: '#E91E8C',
        cyan: '#00D4FF',
        'dark-1': '#111113',
        'dark-2': '#18181B',
        'dark-3': '#1E1E22',
      },
    },
  },
  plugins: [],
}
