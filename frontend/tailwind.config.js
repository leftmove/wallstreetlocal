/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        switzer: ["Switzer", "sans-serif"],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        "green-one": "var(--green-one)",
        "green-two": "var(--green-two)",
        "white-one": "var(--white-one)",
        "offwhite-one": "var(--offwhite-one)",
        "offwhite-two": "var(--offwhite-two)",
        "black-one": "var(--black-one)",
        "black-two": "var(--black-two)",
      },
      keyframes: {
        "height-expand": {
          "0%": { height: "0" },
          "100%": { height: "h-32" },
        },
      },
      animation: {
        "height-expand": "height-expand 0.3s ease",
      },
      transitionProperty: {
        height: "height",
      },
    },
  },
  plugins: [],
};
