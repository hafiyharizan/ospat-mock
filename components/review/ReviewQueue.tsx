"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Check, ClipboardCheck, RotateCcw } from "lucide-react";
import { useReviewStore, useHasHydrated } from "@/store/reviewStore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/format";
import type { ShiftType, AssessmentStatus } from "@/lib/types";

export interface ReviewCaseProps {
  assessmentId: string; employeeId: string; employeeName: string; role: string;
  siteName: string; shift: ShiftType; timestampISO: string;
  readinessScore: number; reactionTimeMs: number; focusScore: number;
  fatigueRisk: number; coordinationScore: number; deviationPct: number;
  status: AssessmentStatus; reason: string; suggestedAction: string; anomalyZ: number;
}

type Filter = "open" | "in-progress" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "open",        label: "Open" },
  { key: "in-progress", label: "In progress" },
  { key: "all",         label: "All" },
];

export function ReviewQueue({ cases }: { cases: ReviewCaseProps[] }) {
  const [filter, setFilter] = useState<Filter>("open");
  const hydrated = useHasHydrated();
  const items       = useReviewStore((s) => s.items);
  const acknowledge = useReviewStore((s) => s.acknowledge);
  const markReviewed= useReviewStore((s) => s.markReviewed);
  const reset       = useReviewStore((s) => s.reset);

  const visible = cases.filter((c) => {
    if (!hydrated) return true;
    const st = items[c.assessmentId]?.status ?? "open";
    if (filter === "all") return true;
    if (filter === "open") return st === "open";
    return st === "acknowledged";
  });

  if (!visible.length)
    return <EmptyState title="No flagged cases" description="All clear for now." />;

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-5 flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="btn-secondary h-8 px-3 text-[12px]"
            style={{
              background: filter === key ? "var(--selected-bg)" : undefined,
              color: filter === key ? "var(--fg)" : "var(--fg-muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((c) => {
          const status = items[c.assessmentId]?.status ?? "open";
          return (
            <li key={c.assessmentId} className="card-padded">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/employees/${c.employeeId}`}
                      className="text-[15px] font-semibold hover:underline"
                      style={{ color: "var(--fg)" }}
                    >
                      {c.employeeName}
                    </Link>
                    <StatusBadge level={c.status} />
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                    {c.role} · {c.siteName} · {c.shift} · {formatDateTime(c.timestampISO)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="eyebrow mb-1">Score</div>
                  <div
                    className="font-mono text-[28px] font-semibold leading-none"
                    style={{ color: "var(--fg)", letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }}
                  >
                    {c.readinessScore.toFixed(1)}
                  </div>
                  <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--fg-subtle)" }}>
                    z {c.anomalyZ.toFixed(2)}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {c.reason}
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                {c.suggestedAction}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => acknowledge(c.assessmentId)}
                  disabled={status !== "open"}
                  className="btn-secondary h-8 gap-1.5 text-[12px] disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  Acknowledge
                </button>
                <button
                  onClick={() => markReviewed(c.assessmentId)}
                  className="btn-primary h-8 gap-1.5 text-[12px]"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Mark reviewed
                </button>
                {status !== "open" && (
                  <button
                    onClick={() => reset(c.assessmentId)}
                    className="btn-ghost h-8 gap-1.5 text-[12px] ml-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
