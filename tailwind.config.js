/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          950: "#090D14",
          900: "#0F172A",
          850: "#131E35",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          100: "#F1F5F9",
          50: "#F8FAFC"
        },
        emerald: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#10B981",
          soft: "#D1FAE5"
        },
        amber: {
          DEFAULT: "#D97706",
          dark: "#B45309",
          light: "#F59E0B",
          soft: "#FEF3C7"
        },
        ice: "#0EA5E9",
        foam: "#F8FAFC"
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"]
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 20px 30px -4px rgba(15, 23, 42, 0.15)'
      }
    }
  },
  plugins: []
};
