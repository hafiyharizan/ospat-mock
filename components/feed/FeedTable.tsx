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
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.employeeName} ${r.role} ${r.siteName}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const handleExport = () => {
    const csv = toCsv(filtered, [
      { header: "Time",         get: (r) => formatDateTime(r.timestampISO) },
      { header: "Employee",     get: (r) => r.employeeName },
      { header: "Site",         get: (r) => r.siteName },
      { header: "Readiness",    get: (r) => r.readinessScore },
      { header: "Reaction(ms)", get: (r) => r.reactionTimeMs },
      { header: "Focus",        get: (r) => r.focusScore },
      { header: "Fatigue",      get: (r) => r.fatigueRisk },
      { header: "Coordination", get: (r) => r.coordinationScore },
      { header: "Status",       get: (r) => r.status },
      { header: "Anomaly Z",    get: (r) => r.anomalyZ },
    ]);
    downloadCsv(`ospat-people-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="card overflow-hidden">
      {/* toolbar */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--fg-subtle)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search person, role, site…"
            className="h-8 w-full rounded-md pl-9 pr-3 text-[13px] outline-none"
            style={{
              background: "var(--bg-sunken)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
        <button
          onClick={handleExport}
          className="ml-auto btn-secondary h-8 gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr
              className="font-mono text-[11px] uppercase tracking-[0.05em]"
              style={{
                background: "var(--bg-sunken)",
                borderBottom: "1px solid var(--border)",
                color: "var(--fg-subtle)",
              }}
            >
              {["Time", "Person", "Metrics", "Score", "State"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.assessmentId}
                style={{ borderBottom: "1px solid var(--border-faint)" }}
                className="hover:bg-ospat-bg-sunken transition-colors"
              >
                <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                  {formatDateTime(r.timestampISO)}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/employees/${r.employeeId}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--fg)" }}
                  >
                    {r.employeeName}
                  </Link>
                  <div className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                    {r.role} · {r.siteName}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-[12px]" style={{ color: "var(--fg-muted)" }}>
                  R {r.reactionTimeMs}ms · Foc {r.focusScore} · Fat {r.fatigueRisk} · Coord {r.coordinationScore}
                </td>
                <td className="px-5 py-3">
                  <span
                    className="font-mono text-[22px] font-semibold leading-none"
                    style={{ color: "var(--fg)", letterSpacing: "-0.01em", fontFeatureSettings: '"tnum"' }}
                  >
                    {r.readinessScore.toFixed(1)}
                  </span>
                  <span className="ml-1.5 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                    z {r.anomalyZ.toFixed(2)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge level={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
