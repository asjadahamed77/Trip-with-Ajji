/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#003b43", 
        secondaryColor: "#85b9b0", 
      },
    },
  },
  plugins: [],
}
