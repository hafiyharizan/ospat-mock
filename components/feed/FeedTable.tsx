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
    downloadCsv(`shift-people-${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
          className="btn-secondary ml-auto h-8 w-full justify-center gap-1.5 sm:w-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* mobile list */}
      <div className="divide-y md:hidden" style={{ borderColor: "var(--border-faint)" }}>
        {filtered.map((r) => (
          <Link
            key={r.assessmentId}
            href={`/employees/${r.employeeId}`}
            className="block px-4 py-3 transition-colors"
            style={{ color: "var(--fg)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold">{r.employeeName}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                  {r.role} · {r.siteName}
                </div>
              </div>
              <StatusBadge level={r.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MobileMetric label="Readiness" value={r.readinessScore.toFixed(1)} />
              <MobileMetric label="Reaction" value={`${r.reactionTimeMs} ms`} />
              <MobileMetric label="Focus" value={r.focusScore} />
              <MobileMetric label="Coord" value={r.coordinationScore} />
            </div>
            <div className="mt-2 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
              {formatDateTime(r.timestampISO)} · z {r.anomalyZ.toFixed(2)}
            </div>
          </Link>
        ))}
      </div>

      {/* desktop table */}
      <div className="hidden overflow-x-auto md:block">
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
                className="transition-colors hover:bg-shift-bg-sunken"
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

function MobileMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="rounded-md px-3 py-2"
      style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.04em]" style={{ color: "var(--fg-subtle)" }}>
        {label}
      </div>
      <div className="mt-1 font-mono text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}
