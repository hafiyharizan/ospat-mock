"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const CYCLE: ThemeMode[] = ["auto", "light", "dark"];

const ICONS = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const;

const LABELS = {
  light: "Light",
  dark: "Dark",
  auto: "Auto",
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const idx = CYCLE.indexOf(theme);
    setTheme(CYCLE[(idx + 1) % CYCLE.length]);
  };

  const Icon = ICONS[theme];
  const label = LABELS[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${label} — click to cycle`}
      aria-label={`Current theme: ${label}. Click to cycle.`}
      className={clsx(
        "inline-flex items-center gap-1.5 h-9 rounded-lg border px-2.5 text-xs font-medium",
        "transition-all duration-200 active:scale-[0.97]",
        "border-zinc-200 bg-white/80 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100",
        "dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.06]",
      )}
    >
      <Icon className="h-3.5 w-3.5 transition-transform duration-300" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
