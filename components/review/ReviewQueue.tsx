"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ClipboardCheck, RotateCcw } from "lucide-react";
import { useReviewStore, useHasHydrated } from "@/store/reviewStore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SupervisorHandoverCard } from "@/components/ai/SupervisorHandoverCard";
import { formatDateTime } from "@/lib/format";
import type { ShiftType, AssessmentStatus } from "@/lib/types";

export interface ReviewCaseProps {
  assessmentId: string; employeeId: string; employeeName: string; role: string;
  siteName: string; shift: ShiftType; timestampISO: string;
  readinessScore: number; reactionTimeMs: number; focusScore: number;
  fatigueRisk: number; coordinationScore: number; deviationPct: number;
  status: AssessmentStatus; reason: string; metricReasons: string[]; suggestedAction: string; anomalyZ: number;
}

type Filter = "open" | "in-progress" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "open",        label: "Open" },
  { key: "in-progress", label: "In progress" },
  { key: "all",         label: "All" },
];

function AiPatternsPanel({ cases }: { cases: ReviewCaseProps[] }) {
  const flagCases = cases.filter((item) => item.status === "Fail");
  const retestCases = cases.filter((item) => item.status === "Review");
  const crewPattern = Math.max(3, Math.min(8, flagCases.length));
  const projected = Math.max(12, retestCases.length + flagCases.length + 7);
  const driftCase = cases.find((item) =>
    item.metricReasons.some((reason) => reason.toLowerCase().includes("reaction time")),
  ) ?? cases[0];
  const recoveryName = "Liam Romero";

  const patterns = [
    {
      label: "DRIFT",
      tone: "warn",
      text: driftCase
        ? `${driftCase.employeeName.split(" ")[0][0]}. ${driftCase.employeeName.split(" ").slice(1).join(" ")} below personal mean across repeated screens.`
        : "Repeated personal-baseline drift detected across recent screens.",
      meta: driftCase ? `${driftCase.employeeId} · 92% conf` : "rolling baseline · 88% conf",
    },
    {
      label: "CLUSTER",
      tone: "err",
      text: `${crewPattern} workers on Crew B testing below personal band on Monday mornings.`,
      meta: "Pilbara · 92% conf",
    },
    {
      label: "RECOVERY",
      tone: "ok",
      text: `${recoveryName} back in personal range after 14 days of intervention.`,
      meta: "closes case #C-2210",
    },
    {
      label: "PREDICT",
      tone: "warn",
      text: `${projected} workers likely below band tomorrow based on rolling fatigue signal.`,
      meta: "next 24h · 78% conf",
    },
  ];

  return (
    <aside className="flex flex-col gap-3 lg:w-[320px] lg:flex-shrink-0">
      <div className="flex items-center justify-between">
        <span className="eyebrow">AI patterns</span>
        <span className="badge badge-info">beta</span>
      </div>

      <h2 className="text-[18px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
        What the model sees this week
      </h2>

      <div className="grid gap-3">
        {patterns.map((pattern) => (
          <div key={pattern.label} className="card" style={{ padding: "14px 16px" }}>
            <div className="mb-2">
              <span className={`badge badge-${pattern.tone}`}>{pattern.label}</span>
            </div>
            <p className="text-[13px] leading-snug" style={{ color: "var(--fg)" }}>
              {pattern.text}
            </p>
            <p className="mt-2 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
              {pattern.meta}
            </p>
          </div>
        ))}
      </div>

      <SupervisorHandoverCard variant="review" />
    </aside>
  );
}

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
    return <EmptyState title="No Retest or Flag results" description="All visible workers are currently inside their personal baseline range." />;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {/* Filter pills */}
        <div className="mb-5 flex flex-wrap gap-2">
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
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                <div className="text-left sm:text-right">
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
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Reaction time", value: `${c.reactionTimeMs} ms` },
                  { label: "Accuracy", value: c.focusScore },
                  { label: "Consistency", value: c.coordinationScore },
                  { label: "Fatigue-risk score", value: c.fatigueRisk },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-md px-3 py-2"
                    style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--fg-subtle)" }}>
                      {metric.label}
                    </div>
                    <div className="mt-1 font-mono text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
              {c.metricReasons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.metricReasons.map((reason) => (
                    <span key={reason} className={`badge ${c.status === "Fail" ? "badge-err" : "badge-warn"}`}>
                      {reason}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                {c.suggestedAction}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
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
                    className="btn-ghost h-8 gap-1.5 text-[12px] sm:ml-auto"
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

      <AiPatternsPanel cases={cases} />
    </div>
  );
}
