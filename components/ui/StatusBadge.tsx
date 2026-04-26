import clsx from "clsx";
import type { RiskLevel } from "@/lib/types";

const STYLES: Record<RiskLevel, string> = {
  Cleared:
    "bg-cleared-soft text-cleared border border-cleared/20",
  Monitor:
    "bg-monitor-soft text-monitor border border-monitor/20",
  "Review Required":
    "bg-review-soft text-review border border-review/30",
};

const DOT: Record<RiskLevel, string> = {
  Cleared: "bg-cleared shadow-[0_0_6px] shadow-cleared/70",
  Monitor: "bg-monitor shadow-[0_0_6px] shadow-monitor/70",
  "Review Required": "bg-review shadow-[0_0_6px] shadow-review/80",
};

export function StatusBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        STYLES[level],
        className,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", DOT[level])} />
      {level}
    </span>
  );
}
