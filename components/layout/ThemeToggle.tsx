"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const modes: ThemeMode[] = ["light", "dark", "auto"];

  return (
    <div
      className="inline-flex h-8 items-center gap-0.5 rounded-lg border p-0.5 sm:h-9"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in oklch, var(--bg-elev) 84%, transparent)",
        color: "var(--fg-muted)",
      }}
      role="group"
      aria-label={`Theme mode. Current mode: ${LABELS[theme]}. Resolved theme: ${resolvedTheme}.`}
    >
      {modes.map((mode) => {
        const Icon = ICONS[mode];
        const active = theme === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            title={`Use ${LABELS[mode]} mode`}
            aria-label={`Use ${LABELS[mode]} mode`}
            aria-pressed={active}
            className="inline-flex h-6 min-w-6 items-center justify-center gap-1 rounded-md px-1.5 text-[11.5px] font-medium transition-all duration-150 active:scale-[0.97] sm:h-7 sm:min-w-7 sm:px-2"
            style={{
              background: active ? "var(--selected-bg)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-subtle)",
              boxShadow: active ? "var(--shadow-xs)" : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{LABELS[mode]}</span>
          </button>
        );
      })}
    </div>
  );
}
