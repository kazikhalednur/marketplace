import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f8fafc', // Soft light background
          dark: '#0f172a', // Deep slate background
        },
        surface: {
          light: '#ffffff', // Cards, containers
          dark: '#1e293b', // Containers, cards
        },
        text: {
          primaryLight: '#1f2937', // Dark gray for text
          secondaryLight: '#6b7280', // Muted text
          primaryDark: '#f8fafc', // Bright white text
          secondaryDark: '#94a3b8', // Slate-muted
        },
        border: {
          light: '#e5e7eb', // Light gray border
          dark: '#334155', // Slate border
        },
        brand: {
          light: '#2563eb', // Blue primary
          dark: '#3b82f6', // Bright blue
        },
        accent: {
          light: '#3b82f6', // Lighter blue highlight
          dark: '#60a5fa', // Light blue
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          ...fontFamily.sans,
        ],
      },
    },
  },
  plugins: [],
}; 