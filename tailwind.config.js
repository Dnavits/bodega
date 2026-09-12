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
        // Portrait Ink — deep navy primary text and structural lines
        ink: {
          DEFAULT: "#08304c",
          light:   "#1e4d6d",
          muted:   "#475569",
          faint:   "#94a3b8",
        },
        // Canvas / surfaces
        canvas:  "#ffffff",
        surface: "#f8fafc",
        // Card borders
        hairline: "rgba(0,0,0,0.07)",
        divider:  "#e2e8f0",
        ash:      "#dedede",
        // Accent — sapphire blue
        accent: {
          DEFAULT: "#2563EB",
          hover:   "#1D4ED8",
          light:   "#60A5FA",
          soft:    "#EFF6FF",
        },
        // Emerald — WhatsApp / success
        emerald: {
          DEFAULT: "#059669",
          hover:   "#047857",
          light:   "#10B981",
          soft:    "#D1FAE5",
        },
        // Pastel washes (Portrait)
        mint:  "#d7ffe2",
        sky:   "#e8f1ff",
        peach: "#ffebd6",
        // Status
        danger: {
          DEFAULT: "#DC2626",
          soft:    "#FEE2E2",
        },
        warning: {
          DEFAULT: "#D97706",
          soft:    "#FEF3C7",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill:  "9999px",
        nav:   "28px",
        card:  "24px",
        btn:   "28px",
        input: "16px",
        tag:   "9999px",
      },
      letterSpacing: {
        display: "-0.04em",
        heading: "-0.03em",
        tight:   "-0.02em",
        eyebrow: "0.14em",
      },
      boxShadow: {
        // Portrait multi-layer shadow system — max 8% opacity
        portrait:   "0 16px 16px -8px rgba(0,0,0,0.03), 0 10px 10px -5px rgba(0,0,0,0.03), 0 5px 5px -2.5px rgba(0,0,0,0.03), 0 3px 3px -1.5px rgba(0,0,0,0.03), 0 2px 2px -1px rgba(0,0,0,0.03), 0 1px 1px -0.5px rgba(0,0,0,0.03)",
        nav:        "0 0 0 1px rgba(0,0,0,0.06), 0 16px 16px -8px rgba(0,0,0,0.03), 0 8px 8px -4px rgba(0,0,0,0.03), 0 4px 4px -2px rgba(0,0,0,0.03)",
        card:       "0 0 0 1px rgba(0,0,0,0.06), 0 16px 16px -8px rgba(0,0,0,0.03), 0 8px 8px -4px rgba(0,0,0,0.03), 0 4px 4px -2px rgba(0,0,0,0.02)",
        "card-hover":"0 0 0 1px rgba(0,0,0,0.08), 0 20px 20px -10px rgba(0,0,0,0.07), 0 10px 10px -5px rgba(0,0,0,0.04), 0 5px 5px -2.5px rgba(0,0,0,0.03)",
        subtle:     "0 0 0 1px rgba(0,0,0,0.06)",
      },
    }
  },
  plugins: []
};
