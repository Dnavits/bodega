/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#FAF7F2",
        atelier: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
          950: "#1A1624",
          night: "#17141D",
        },
        emerald: {
          whatsapp: "#059669",
          whatsappHover: "#047857",
          whatsappLight: "#10B981"
        }
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"]
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(23, 20, 29, 0.05)',
        'luxury-hover': '0 20px 40px -10px rgba(126, 34, 206, 0.12)'
      }
    }
  },
  plugins: []
};
