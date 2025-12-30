/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#171ACB", 
        secondary: "#5C5F65", 
        background: "#F6F6F6", 
        surface: "#FFFFFF",
        black: "#000000",
      },
      fontFamily: {
        sans: ["Outfit-Regular"], 
        bold: ["Outfit-Bold"],
      },
    },
    plugins: [],
  },
}