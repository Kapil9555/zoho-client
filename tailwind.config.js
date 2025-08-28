// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        lightGrey: "#797979",
        darkGrey: "#333333",
        brandBlue: "#3E57A7",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),

    // 👇 Add this custom plugin
    function ({ addUtilities }) {
      addUtilities({
        '.no-spinner': {
          '-moz-appearance': 'textfield',
        },
        '.no-spinner::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
        '.no-spinner::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
      });
    },
  ],
};
