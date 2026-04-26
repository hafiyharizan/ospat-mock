"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Check, ClipboardCheck, NotebookPen, RotateCcw } from "lucide-react";
import { useReviewStore, useHasHydrated } from "@/store/reviewStore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/format";
import type { ShiftType, RiskLevel } from "@/lib/types";

export interface ReviewCaseProps {
  assessmentId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  siteName: string;
  shift: ShiftType;
  timestampISO: string;
  score: number;
  baseline: number;
  deviationPct: number;
  riskLevel: RiskLevel;
  reason: string;
  suggestedAction: string;
}

export function ReviewQueue({ cases }: { cases: ReviewCaseProps[] }) {
  const [filter, setFilter] = useState<"open" | "in-progress" | "all">("open");
  const hydrated = useHasHydrated();
  const items = useReviewStore((s) => s.items);
  const acknowledge = useReviewStore((s) => s.acknowledge);
  const markReviewed = useReviewStore((s) => s.markReviewed);
  const reset = useReviewStore((s) => s.reset);

  const counts = (() => {
    let open = 0, inProgress = 0, reviewed = 0;
    for (const c of cases) {
      const status = items[c.assessmentId]?.status ?? "open";
      if (status === "open") open++;
      else if (status === "acknowledged") inProgress++;
      else reviewed++;
    }
    return { open, inProgress, reviewed, total: cases.length };
  })();

  const visible = cases.filter((c) => {
    if (!hydrated) return filter === "all" || filter === "open";
    const status = items[c.assessmentId]?.status ?? "open";
    if (filter === "open") return status === "open";
    if (filter === "in-progress") return status === "acknowledged";
    return true;
  });

  return (
    <div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-5">
        <Tab
          label="Open"
          value={counts.open}
          active={filter === "open"}
          onClick={() => setFilter("open")}
          accent="rose"
        />
        <Tab
          label="In progress"
          value={counts.inProgress}
          active={filter === "in-progress"}
          onClick={() => setFilter("in-progress")}
          accent="amber"
        />
        <Tab
          label="Reviewed"
          value={counts.reviewed}
          active={false}
          onClick={() => setFilter("all")}
          accent="emerald"
        />
        <Tab
          label="All flagged today"
          value={counts.total}
          active={filter === "all"}
          onClick={() => setFilter("all")}
          accent="indigo"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={
            filter === "open"
              ? "No open cases"
              : filter === "in-progress"
                ? "No cases in progress"
                : "No flagged cases"
          }
          description={
            filter === "open"
              ? "All flagged employees have been acknowledged or reviewed. Nice work."
              : "Acknowledge an open case to move it here."
          }
          icon={ClipboardCheck}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((c) => {
            const item = hydrated ? items[c.assessmentId] : undefined;
            const status = item?.status ?? "open";
            return (
              <li key={c.assessmentId} className="panel-padded">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/employees/${c.employeeId}`}
                        className="text-base font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-200"
                      >
                        {c.employeeName}
                      </Link>
                      <StatusBadge level={c.riskLevel} />
                      <StatusChip status={status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span>{c.role}</span>
                      <span>{c.siteName}</span>
                      <span>{c.shift} shift</span>
                      <span>{formatDateTime(c.timestampISO)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Score
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-white tabular-nums">
                      {c.score}
                      <span className="text-xs text-zinc-500 font-normal">
                        {" "}
                        / {c.baseline}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "text-xs tabular-nums",
                        c.deviationPct < -15
                          ? "text-rose-300"
                          : "text-amber-300",
                      )}
                    >
                      {c.deviationPct.toFixed(1)}% Δ
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Reason flagged
                    </div>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{c.reason}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Suggested action
                    </div>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {c.suggestedAction}
                    </p>
                  </div>
                </div>

                <NoteEditor assessmentId={c.assessmentId} />

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => acknowledge(c.assessmentId)}
                    disabled={status !== "open"}
                    className={clsx(
                      "btn-soft",
                      status !== "open" && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Acknowledge
                  </button>
                  <button
                    onClick={() => markReviewed(c.assessmentId)}
                    disabled={status === "reviewed"}
                    className={clsx(
                      "btn-primary",
                      status === "reviewed" && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Mark reviewed
                  </button>
                  {status !== "open" && (
                    <button
                      onClick={() => reset(c.assessmentId)}
                      className="btn-ghost text-xs ml-auto"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tab({
  label,
  value,
  active,
  onClick,
  accent,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  accent: "rose" | "amber" | "emerald" | "indigo";
}) {
  const dot =
    accent === "rose"
      ? "bg-rose-400"
      : accent === "amber"
        ? "bg-amber-400"
        : accent === "emerald"
          ? "bg-emerald-400"
          : "bg-indigo-400";
  return (
    <button
      onClick={onClick}
      className={clsx(
        "panel-padded text-left transition-colors duration-150",
        active
          ? "ring-1 ring-indigo-400/40"
          : "hover:bg-zinc-50 dark:hover:bg-white/[0.04]",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={clsx("h-1.5 w-1.5 rounded-full", dot)} />
        <span className="label">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white tabular-nums">
        {value}
      </div>
    </button>
  );
}

function StatusChip({ status }: { status: "open" | "acknowledged" | "reviewed" }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]">
        Open
      </span>
    );
  }
  if (status === "acknowledged") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
        Acknowledged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
      Reviewed
    </span>
  );
}

function NoteEditor({ assessmentId }: { assessmentId: string }) {
  const item = useReviewStore((s) => s.items[assessmentId]);
  const setNote = useReviewStore((s) => s.setNote);
  const [open, setOpen] = useState(!!item?.note);
  const [draft, setDraft] = useState(item?.note ?? "");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
      >
        <NotebookPen className="h-3 w-3" />
        {item?.note ? "Edit note" : "Add note"}
      </button>
    );
  }

  return (
    <div className="mt-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => setNote(assessmentId, draft)}
        placeholder="Supervisor note (saved locally)…"
        rows={2}
        className="input h-auto py-2 resize-y"
      />
    </div>
  );
}
