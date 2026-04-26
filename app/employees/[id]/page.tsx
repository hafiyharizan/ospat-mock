import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, MapPin, User } from "lucide-react";
import clsx from "clsx";
import { getEmployeeDetail, getEmployees } from "@/lib/data";
import { ChartCard } from "@/components/charts/ChartCard";
import { EmployeeScoreChart } from "@/components/charts/EmployeeScoreChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { formatDateTime } from "@/lib/format";

export function generateStaticParams() { return getEmployees().map((e) => ({ id: e.id })); }

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = getEmployeeDetail(id);
  if (!detail) notFound();
  const chartData = detail.recent.map((a, idx) => ({ idx, score: a.readinessScore, label: a.timestampISO.slice(5, 10) }));

  return <div><Link href="/feed" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-3"><ArrowLeft className="h-3 w-3" />Back to live feed</Link>
  <div className="panel-padded"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-200 dark:border-white/[0.06]"><User className="h-5 w-5 text-indigo-300" /></div><div><h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{detail.employee.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400"><span>{detail.employee.role}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{detail.site.name}</span><span>{detail.employee.primaryShift} shift</span></div></div></div><StatusBadge level={detail.latest.status} className="text-sm px-3 py-1" /></div></div>

  <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4"><StatCard label="Readiness" value={detail.latest.readinessScore.toFixed(1)} /><StatCard label="Reaction (ms)" value={detail.latest.metrics.reactionTimeMs} /><StatCard label="Focus" value={detail.latest.metrics.focusScore} /><StatCard label="Fatigue risk" value={detail.latest.metrics.fatigueRisk} accent={detail.latest.metrics.fatigueRisk>65?"danger":"warning"} /></div>
  <div className="mt-4"><InsightCard text={detail.insight} level={detail.latest.status} /></div>

  <div className="mt-4 grid gap-4 lg:grid-cols-3"><div className="lg:col-span-2"><ChartCard title="Readiness history" subtitle="20 assessments"><EmployeeScoreChart data={chartData} baseline={80} /></ChartCard></div><div className="panel"><div className="px-5 pt-5"><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Timeline</h3></div><ul className="px-5 py-4 max-h-80 overflow-y-auto space-y-3">{[...detail.recent].reverse().slice(0,12).map((a)=><li key={a.id} className="flex items-start gap-3"><span className={clsx("mt-1.5 h-2 w-2 rounded-full",a.status==="Pass"?"bg-cleared":a.status==="Review"?"bg-monitor":"bg-review")}/><div className="flex-1"><div className="flex items-center justify-between"><span className="text-xs text-zinc-500">{formatDateTime(a.timestampISO)}</span><span className="text-xs font-semibold">{a.readinessScore.toFixed(1)}</span></div><div className="text-xs text-zinc-400">{a.status} · z {a.anomalyZ.toFixed(2)}</div></div></li>)}</ul></div></div></div>;
}

function InsightCard({ text, level }: { text: string; level: "Pass" | "Review" | "Fail" }) {
  const accent = level === "Fail" ? "border-rose-400/20 bg-rose-50 dark:bg-rose-400/[0.04]" : level === "Review" ? "border-amber-400/20 bg-amber-50 dark:bg-amber-400/[0.04]" : "border-emerald-400/20 bg-emerald-50 dark:bg-emerald-400/[0.04]";
  return <div className={clsx("rounded-xl border p-4 flex gap-3 items-start", accent)}><div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/60 border border-zinc-200 dark:border-white/[0.06]"><Lightbulb className="h-4 w-4" /></div><div><div className="text-[10px] uppercase tracking-widest text-zinc-500">Insight</div><p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-100">{text}</p></div></div>;
}
