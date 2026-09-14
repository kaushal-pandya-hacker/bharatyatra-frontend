import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B35',       // Rann Sunset Orange
          'primary-hover': '#E05522',
          secondary: '#008080',     // Gir Royal Teal
          dark: '#0A192F',          // Somnath Deep Navy
          light: '#F4F1EA',         // Kutch Soft Sand
          gold: '#FFC107',          // Saurashtra Gold
        },
        surface: {
          dark: '#0A192F',
          glass: 'rgba(255, 255, 255, 0.75)',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
