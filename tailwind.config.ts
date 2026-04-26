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
      animation: {
        "fade-in": "fadeIn 0.25s ease-out both",
        "fade-up": "fadeUp 0.35s ease-out both",
        "slide-in": "slideIn 0.28s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
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
