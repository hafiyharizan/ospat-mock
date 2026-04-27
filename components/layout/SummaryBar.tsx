import { getDashboardKpis } from "@/lib/data";
import { formatPct } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

function TrendChip({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-zinc-500">
        <Minus className="h-3 w-3" />
        0.0%
      </span>
    );
  }

  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-1 text-[var(--oc-sage)]"
          : "inline-flex items-center gap-1 text-[var(--oc-coral)]"
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
    <div className="border-b border-zinc-900/10 bg-[var(--oc-paper-2)]/75 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 font-mono text-[11px] sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Today</span>
          <span className="font-semibold text-zinc-950">{kpis.totalToday}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--oc-sage)]" />
          <span>{kpis.pass} pass</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--oc-amber)]" />
          <span>{kpis.review} retest</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--oc-coral)]" />
          <span>{kpis.fail} flag</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Avg readiness</span>
          <span className="font-semibold text-zinc-950">{kpis.avgReadiness}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">7-day trend</span>
          <TrendChip value={kpis.trendVsPrevious7Days} />
        </div>
      </div>
    </div>
  );
}
