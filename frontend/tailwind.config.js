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
        "green-three": "var(--green-three)",
        "white-one": "var(--white-one)",
        "white-two": "var(--white-two)",
        "offwhite-one": "var(--offwhite-one)",
        "offwhite-two": "var(--offwhite-two)",
        "black-one": "var(--black-one)",
        "black-two": "var(--black-two)",
        "black-three": "var(--black-three)",
      },
      keyframes: {
        "height-expand": {
          "0%": { height: "0" },
          "100%": { height: "h-32" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
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
