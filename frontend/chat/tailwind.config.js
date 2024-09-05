/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      customBlue: "#1230AE",
      customPurple: "#6C48C5",
      customPink: "#C68FE6",
      customWhite: "#FFF7F7",
      customRed: "#FF0000"
    }
  },
  plugins: [],
}

