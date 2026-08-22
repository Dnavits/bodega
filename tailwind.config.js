/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bottle: {
          DEFAULT: "#0D5C48", // Darker premium green
          dark: "#084032",
          light: "#208269"
        },
        soda: {
          DEFAULT: "#E85D31", // More vibrant orange
          dark: "#B84520"
        },
        cream: "#FDFBF7",
        charcoal: "#1A1A1A", // Darker charcoal for better contrast
        bubble: "#FCCC7A"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      }
    }
  },
  plugins: []
};
