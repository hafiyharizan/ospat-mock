import clsx from "clsx";
import type { AssessmentStatus } from "@/lib/types";

const TONE: Record<AssessmentStatus, string> = {
  Pass:   "badge-ok",
  Review: "badge-warn",
  Fail:   "badge-err",
};

const LABELS: Record<AssessmentStatus, string> = {
  Pass:   "Pass",
  Review: "Retest",
  Fail:   "Flag",
};

export const DOT_COLOR: Record<AssessmentStatus, string> = {
  Pass:   "var(--success)",
  Review: "var(--warning)",
  Fail:   "var(--danger)",
};

export function StatusBadge({
  level,
  className,
}: {
  level: AssessmentStatus;
  className?: string;
}) {
  return (
    <span className={clsx("badge", TONE[level], className)}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT_COLOR[level] }}
      />
      {LABELS[level]}
    </span>
  );
}
