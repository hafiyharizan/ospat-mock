"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

/**
 * Returns theme-aware color tokens for Recharts components.
 * Safe to call on initial render — defaults to dark until hydration resolves.
 */
export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return {
    grid: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
    axisLine: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.10)",
    axisTick: "#71717a",
    tooltipBg: dark ? "rgba(9,9,11,0.95)" : "rgba(255,255,255,0.98)",
    tooltipBorder: dark
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.08)",
    tooltipLabel: dark ? "#a1a1aa" : "#71717a",
    tooltipItem: dark ? "#e4e4e7" : "#18181b",
    tooltipCursor: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    dotStroke: dark ? "#0a0a0b" : "#ffffff",
  } as const;
}
