/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#faf9f7', dark: '#14160f' },
        surface: { DEFAULT: '#ffffff', dark: '#1d201a' },
        'surface-sunken': { DEFAULT: '#f1f2ef', dark: '#262922' },
        border: { DEFAULT: '#e6e5e0', dark: '#33362c' },
        ink: {
          DEFAULT: '#1c1f1a',
          dark: '#edeee7',
          secondary: '#63695f',
          'secondary-dark': '#a6ab9d',
          tertiary: '#9a9f92',
          'tertiary-dark': '#767b6d',
        },
        accent: {
          DEFAULT: '#2f6f4e',
          dark: '#6cc494',
          strong: '#235a3e',
          'strong-dark': '#86d3a9',
        },
        'accent-soft': { DEFAULT: '#e7f1ea', dark: '#223327' },
        danger: { DEFAULT: '#b3493f', dark: '#d97b70' },
        emotion: {
          1: '#c2564a',
          2: '#d99257',
          3: '#d3b355',
          4: '#8fb06a',
          5: '#3f8f63',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        control: '12px',
        card: '18px',
      },
    },
  },
  plugins: [],
};
