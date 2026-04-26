import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        cleared: {
          DEFAULT: "#34d399",
          soft: "rgba(52, 211, 153, 0.12)",
          ring: "rgba(52, 211, 153, 0.35)",
        },
        monitor: {
          DEFAULT: "#fbbf24",
          soft: "rgba(251, 191, 36, 0.12)",
          ring: "rgba(251, 191, 36, 0.35)",
        },
        review: {
          DEFAULT: "#fb7185",
          soft: "rgba(251, 113, 133, 0.12)",
          ring: "rgba(251, 113, 133, 0.40)",
        },
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "command-radial":
          "radial-gradient(1200px 600px at 70% -10%, rgba(99,102,241,0.10), transparent 60%), radial-gradient(900px 400px at 0% 0%, rgba(16,185,129,0.06), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
