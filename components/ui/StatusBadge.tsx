import clsx from "clsx";
import type { AssessmentStatus } from "@/lib/types";

const STYLES: Record<AssessmentStatus, string> = {
  Pass: "bg-cleared-soft text-cleared border border-cleared/20",
  Review: "bg-monitor-soft text-monitor border border-monitor/20",
  Fail: "bg-review-soft text-review border border-review/30",
};

const DOT: Record<AssessmentStatus, string> = {
  Pass: "bg-cleared shadow-[0_0_6px] shadow-cleared/70",
  Review: "bg-monitor shadow-[0_0_6px] shadow-monitor/70",
  Fail: "bg-review shadow-[0_0_6px] shadow-review/80",
};

export function StatusBadge({ level, className }: { level: AssessmentStatus; className?: string }) {
  return <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", STYLES[level], className)}><span className={clsx("h-1.5 w-1.5 rounded-full", DOT[level])} />{level}</span>;
}
