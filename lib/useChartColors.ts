"use client";

/**
 * Returns theme-aware color tokens for Recharts components.
 * Safe to call on initial render — defaults to dark until hydration resolves.
 */
export function useChartColors() {
  return {
    grid: "rgba(26,29,35,0.06)",
    axisLine: "rgba(26,29,35,0.12)",
    axisTick: "rgba(52,55,61,0.62)",
    tooltipBg: "rgba(247,244,239,0.98)",
    tooltipBorder: "1px solid rgba(26,29,35,0.12)",
    tooltipLabel: "rgba(52,55,61,0.68)",
    tooltipItem: "#1a1d23",
    tooltipCursor: "rgba(26,29,35,0.04)",
    dotStroke: "#f7f4ef",
  } as const;
}
