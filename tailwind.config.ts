import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
        mono:    ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular"],
        display: ["var(--font-inter)", "Inter", "-apple-system", "system-ui"],
      },
      colors: {
        shift: {
          bg:          "var(--bg)",
          "bg-elev":   "var(--bg-elev)",
          "bg-sunken": "var(--bg-sunken)",
          fg:          "var(--fg)",
          "fg-muted":  "var(--fg-muted)",
          "fg-subtle": "var(--fg-subtle)",
          "fg-faint":  "var(--fg-faint)",
          border:      "var(--border)",
          accent:      "var(--accent)",
          success:     "var(--success)",
          warning:     "var(--warning)",
          danger:      "var(--danger)",
          info:        "var(--info)",
        },
      },
      borderRadius: {
        xs:  "3px",
        sm:  "5px",
        md:  "7px",
        lg:  "10px",
        xl:  "14px",
        "2xl": "20px",
      },
      boxShadow: {
        xs:     "var(--shadow-xs)",
        sm:     "var(--shadow-sm)",
        md:     "var(--shadow-md)",
        button: "var(--shadow-button)",
      },
      animation: {
        "fade-in":   "fadeIn 200ms cubic-bezier(0.22,1,0.36,1) both",
        "fade-up":   "fadeUp 240ms cubic-bezier(0.22,1,0.36,1) both",
        "shift-pulse":"shiftPulse 1.6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shiftPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.35" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
