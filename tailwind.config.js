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
          950: "#080B10",
          900: "#0D131F",
          850: "#131C2D",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          100: "#F1F5F9",
          50: "#F8FAFC"
        },
        // Reemplazo del naranja por azul zafiro / cobalto tecnológico y elegante
        accent: {
          DEFAULT: "#2563EB", // Azul eléctrico / zafiro elegante
          hover: "#1D4ED8",
          light: "#38BDF8",   // Azul cielo suave
          glow: "#60A5FA",
          soft: "#EFF6FF"
        },
        emerald: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#10B981",
          soft: "#D1FAE5"
        },
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
