/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#f8fafa",
          100: "#edf1f7",
          200: "#d6deed",
          300: "#aebbd6",
          400: "#8193b7",
          500: "#657099",
          600: "#51547a",
          700: "#3d3f5c",
          800: "#2a2a3f",
          900: "#181927",
        },
      },
    },
  },
  plugins: [],
}
