import { getDashboardKpis } from "@/lib/data";
import { formatPct } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

function TrendChip({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-zinc-500">
        <Minus className="h-3 w-3" /> 0.0%
      </span>
    );
  }
  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-1 text-emerald-400"
          : "inline-flex items-center gap-1 text-rose-400"
      }
    >
      <Icon className="h-3 w-3" />
      {formatPct(Math.abs(value))}
    </span>
  );
}

export function SummaryBar() {
  const kpis = getDashboardKpis();

  return (
    <div className="border-b border-white/[0.06] bg-zinc-950/60 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 px-4 sm:px-5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Today</span>
          <span className="text-zinc-100 font-semibold">{kpis.totalToday}</span>
          <span className="text-zinc-500">assessments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/70" />
          <span className="text-zinc-100 font-semibold">{kpis.cleared}</span>
          <span className="text-zinc-500">cleared</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px] shadow-rose-400/70" />
          <span className="text-zinc-100 font-semibold">{kpis.flagged}</span>
          <span className="text-zinc-500">flagged</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Avg score</span>
          <span className="text-zinc-100 font-semibold">{kpis.avgScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">7-day trend</span>
          <TrendChip value={kpis.trendVsPrevious7Days} />
        </div>
        <div className="hidden sm:flex ml-auto items-center gap-1.5 text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live · simulated stream
        </div>
      </div>
    </div>
  );
}
