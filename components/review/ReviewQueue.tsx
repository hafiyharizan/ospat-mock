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
  assessmentId: string; employeeId: string; employeeName: string; role: string; siteName: string; shift: ShiftType; timestampISO: string;
  readinessScore: number; reactionTimeMs: number; focusScore: number; fatigueRisk: number; coordinationScore: number; deviationPct: number; status: AssessmentStatus; reason: string; suggestedAction: string; anomalyZ: number;
}

export function ReviewQueue({ cases }: { cases: ReviewCaseProps[] }) {
  const [filter, setFilter] = useState<"open"|"in-progress"|"all">("open");
  const hydrated = useHasHydrated();
  const items = useReviewStore((s) => s.items);
  const acknowledge = useReviewStore((s) => s.acknowledge);
  const markReviewed = useReviewStore((s) => s.markReviewed);
  const reset = useReviewStore((s) => s.reset);

  const visible = cases.filter((c)=>{ if(!hydrated) return true; const st=items[c.assessmentId]?.status??"open"; return filter==="all"?true:filter==="open"?st==="open":st==="acknowledged";});

  if (!visible.length) return <EmptyState title="No flagged cases" description="All clear for now." />;

  return <div><div className="mb-4 flex gap-2"><button className={clsx("btn-soft",filter==="open"&&"ring-1 ring-indigo-400/40")} onClick={()=>setFilter("open")}>Open</button><button className={clsx("btn-soft",filter==="in-progress"&&"ring-1 ring-indigo-400/40")} onClick={()=>setFilter("in-progress")}>In progress</button><button className={clsx("btn-soft",filter==="all"&&"ring-1 ring-indigo-400/40")} onClick={()=>setFilter("all")}>All</button></div><ul className="space-y-3">{visible.map((c)=>{const status=items[c.assessmentId]?.status??"open";return <li key={c.assessmentId} className="panel-padded"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Link href={`/employees/${c.employeeId}`} className="font-semibold">{c.employeeName}</Link><StatusBadge level={c.status} /></div><div className="mt-1 text-xs text-zinc-500">{c.role} · {c.siteName} · {c.shift} · {formatDateTime(c.timestampISO)}</div></div><div className="text-right text-xs">Readiness {c.readinessScore.toFixed(1)}<div>z {c.anomalyZ.toFixed(2)}</div></div></div><div className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{c.reason}</div><div className="mt-2 text-xs text-zinc-500">{c.suggestedAction}</div><div className="mt-4 flex gap-2"><button onClick={()=>acknowledge(c.assessmentId)} disabled={status!=="open"} className="btn-soft"><Check className="h-3 w-3"/>Acknowledge</button><button onClick={()=>markReviewed(c.assessmentId)} className="btn-primary"><ClipboardCheck className="h-3 w-3"/>Mark reviewed</button>{status!=="open"&&<button onClick={()=>reset(c.assessmentId)} className="btn-ghost ml-auto"><RotateCcw className="h-3 w-3"/>Reset</button>}</div></li>;})}</ul></div>;
}
