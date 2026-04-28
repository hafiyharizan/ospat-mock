import { getDashboardKpis } from "@/lib/data";
import { formatPct } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

function TrendChip({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1" style={{ color: "var(--fg-subtle)" }}>
        <Minus className="h-3 w-3" />
        0.0%
      </span>
    );
  }

  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ color: positive ? "var(--success)" : "var(--danger)" }}
    >
      <Icon className="h-3 w-3" />
      {formatPct(Math.abs(value))}
    </span>
  );
}

export function SummaryBar() {
  const kpis = getDashboardKpis();

  return (
    <div
      className="border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in oklch, var(--bg-elev) 78%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 font-mono text-[11px] sm:px-5">
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--fg-subtle)" }}>Today</span>
          <span className="font-semibold" style={{ color: "var(--fg)" }}>{kpis.totalToday}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          <span>{kpis.pass} pass</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--warning)" }} />
          <span>{kpis.review} retest</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--danger)" }} />
          <span>{kpis.fail} flag</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--fg-subtle)" }}>Avg readiness</span>
          <span className="font-semibold" style={{ color: "var(--fg)" }}>{kpis.avgReadiness}</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--fg-subtle)" }}>7-day trend</span>
          <TrendChip value={kpis.trendVsPrevious7Days} />
        </div>
      </div>
    </div>
  );
}
