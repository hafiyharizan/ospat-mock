"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FeedRow } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { downloadCsv, toCsv } from "@/lib/csv";

export function FeedTable({ rows }: { rows: FeedRow[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => rows.filter((r) => `${r.employeeName} ${r.role} ${r.siteName}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  const handleExport = () => {
    const csv = toCsv(filtered, [
      { header: "Time", get: (r) => formatDateTime(r.timestampISO) },
      { header: "Employee", get: (r) => r.employeeName },
      { header: "Site", get: (r) => r.siteName },
      { header: "Readiness", get: (r) => r.readinessScore },
      { header: "Reaction(ms)", get: (r) => r.reactionTimeMs },
      { header: "Focus", get: (r) => r.focusScore },
      { header: "Fatigue", get: (r) => r.fatigueRisk },
      { header: "Coordination", get: (r) => r.coordinationScore },
      { header: "Status", get: (r) => r.status },
      { header: "Anomaly Z", get: (r) => r.anomalyZ },
    ]);
    downloadCsv(`ospat-feed-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return <div className="panel"><div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-4 border-b border-zinc-100 dark:border-white/[0.05]"><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, role, site…" className="input pl-9" /></div><button onClick={handleExport} className="btn-soft ml-auto"><Download className="h-3.5 w-3.5" />Export CSV</button></div>
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-white/[0.05]"><th className="px-5 py-3">Time</th><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Metrics</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{filtered.map((r)=><tr key={r.assessmentId} className="border-b border-zinc-50 dark:border-white/[0.04]"><td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{formatDateTime(r.timestampISO)}</td><td className="px-5 py-3"><Link href={`/employees/${r.employeeId}`} className="font-medium">{r.employeeName}</Link><div className="text-xs text-zinc-500">{r.role} · {r.siteName}</div></td><td className="px-5 py-3 text-xs">R {r.reactionTimeMs}ms · Foc {r.focusScore} · Fat {r.fatigueRisk} · Coord {r.coordinationScore}</td><td className="px-5 py-3">{r.readinessScore.toFixed(1)} <span className="text-xs text-zinc-500">z {r.anomalyZ.toFixed(2)}</span></td><td className="px-5 py-3"><StatusBadge level={r.status} /></td></tr>)}</tbody></table></div></div>;
}
