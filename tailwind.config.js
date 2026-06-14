/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        soot: "#17201d",
        civic: "#0f766e",
        river: "#0284c7",
        leaf: "#16a34a",
        amberline: "#d97706",
        signal: "#e11d48",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 118, 110, 0.22)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
