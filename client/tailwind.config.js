/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        autumn: {
          light: "#FFF8F0",
          orange: "#FFB347",
          brown: "#8B5C2D",
          yellow: "#FFD580",
          red: "#D7263D",
          cream: "#F5E9DA",
        },
      },
    },
  },
  plugins: [],
};
