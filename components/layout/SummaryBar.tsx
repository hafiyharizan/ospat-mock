import { getDashboardKpis } from "@/lib/data";
import { formatPct } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

function TrendChip({ value }: { value: number }) {
  if (value === 0) return <span className="inline-flex items-center gap-1 text-zinc-500"><Minus className="h-3 w-3" />0.0%</span>;
  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={positive ? "inline-flex items-center gap-1 text-emerald-400" : "inline-flex items-center gap-1 text-rose-400"}><Icon className="h-3 w-3" />{formatPct(Math.abs(value))}</span>;
}

export function SummaryBar() {
  const kpis = getDashboardKpis();
  return <div className="border-b border-zinc-200 dark:border-white/[0.06] bg-white/60 dark:bg-zinc-950/60 backdrop-blur"><div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 sm:px-5 py-2.5 text-xs"><div className="flex items-center gap-2"><span className="text-zinc-500">Today</span><span className="font-semibold">{kpis.totalToday}</span></div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/><span>{kpis.pass} pass</span></div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-400"/><span>{kpis.review} review</span></div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-400"/><span>{kpis.fail} fail</span></div><div className="flex items-center gap-2"><span className="text-zinc-500">Avg readiness</span><span className="font-semibold">{kpis.avgReadiness}</span></div><div className="flex items-center gap-2"><span className="text-zinc-500">7-day trend</span><TrendChip value={kpis.trendVsPrevious7Days} /></div></div></div>;
}
