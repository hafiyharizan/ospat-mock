"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Download, Search } from "lucide-react";
import clsx from "clsx";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FeedRow } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { downloadCsv, toCsv } from "@/lib/csv";
import { useReviewStore, useHasHydrated } from "@/store/reviewStore";

type SortKey = "timestampISO" | "score" | "deviationPct" | "risk";

const RISK_ORDER: Record<string, number> = {
  "Review Required": 0,
  Monitor: 1,
  Cleared: 2,
};

export function FeedTable({ rows }: { rows: FeedRow[] }) {
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestampISO");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const hydrated = useHasHydrated();
  const reviewMap = useReviewStore((s) => s.items);

  const sites = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.siteId, r.siteName));
    return [...map.entries()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (siteFilter !== "all" && r.siteId !== siteFilter) return false;
      if (statusFilter !== "all" && r.riskLevel !== statusFilter) return false;
      if (
        q &&
        !r.employeeName.toLowerCase().includes(q) &&
        !r.role.toLowerCase().includes(q) &&
        !r.siteName.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, search, siteFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "timestampISO":
          cmp = a.timestampISO < b.timestampISO ? -1 : 1;
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "deviationPct":
          cmp = a.deviationPct - b.deviationPct;
          break;
        case "risk":
          cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "timestampISO" ? "desc" : "asc");
    }
  };

  const handleExport = () => {
    const csv = toCsv(sorted, [
      { header: "Time", get: (r) => formatDateTime(r.timestampISO) },
      { header: "Employee", get: (r) => r.employeeName },
      { header: "Role", get: (r) => r.role },
      { header: "Site", get: (r) => r.siteName },
      { header: "Shift", get: (r) => r.shift },
      { header: "Score", get: (r) => r.score },
      { header: "Baseline", get: (r) => r.baseline },
      { header: "Deviation %", get: (r) => r.deviationPct },
      { header: "Status", get: (r) => r.riskLevel },
    ]);
    downloadCsv(`ospat-feed-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="panel">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.05]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, role, site…"
            className="input pl-9"
          />
        </div>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="input flex-1 min-w-0 sm:flex-none sm:w-44"
        >
          <option value="all">All sites</option>
          {sites.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input flex-1 min-w-0 sm:flex-none sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="Cleared">Cleared</option>
          <option value="Monitor">Monitor</option>
          <option value="Review Required">Review Required</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {sorted.length} of {rows.length}
          </span>
          <button onClick={handleExport} className="btn-soft">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No matching assessments"
            description="Try clearing filters or adjusting your search."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-b border-white/[0.05]">
                <Th
                  active={sortKey === "timestampISO"}
                  dir={sortDir}
                  onClick={() => toggleSort("timestampISO")}
                >
                  Time
                </Th>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Site / Shift</th>
                <Th
                  active={sortKey === "score"}
                  dir={sortDir}
                  onClick={() => toggleSort("score")}
                >
                  Score
                </Th>
                <Th
                  active={sortKey === "deviationPct"}
                  dir={sortDir}
                  onClick={() => toggleSort("deviationPct")}
                >
                  Δ Baseline
                </Th>
                <Th
                  active={sortKey === "risk"}
                  dir={sortDir}
                  onClick={() => toggleSort("risk")}
                >
                  Status
                </Th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const reviewItem = hydrated ? reviewMap[r.assessmentId] : undefined;
                const actionLabel =
                  reviewItem?.status === "reviewed"
                    ? "Reviewed"
                    : reviewItem?.status === "acknowledged"
                      ? "Acknowledged"
                      : r.riskLevel === "Cleared"
                        ? "—"
                        : "Pending";
                return (
                  <tr
                    key={r.assessmentId}
                    className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">
                      {formatDateTime(r.timestampISO)}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/employees/${r.employeeId}`}
                        className="text-zinc-100 hover:text-white font-medium"
                      >
                        {r.employeeName}
                      </Link>
                      <div className="text-xs text-zinc-500">{r.role}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-300 whitespace-nowrap">
                      {r.siteName}
                      <div className="text-xs text-zinc-500">{r.shift}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-100 font-semibold tabular-nums">
                      {r.score}
                      <span className="text-xs text-zinc-500 font-normal">
                        {" "}
                        / {r.baseline}
                      </span>
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      <span
                        className={clsx(
                          r.deviationPct < -10
                            ? "text-rose-300"
                            : r.deviationPct < 0
                              ? "text-amber-300"
                              : "text-emerald-300",
                        )}
                      >
                        {r.deviationPct > 0 ? "+" : ""}
                        {r.deviationPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge level={r.riskLevel} />
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {actionLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  active,
  dir,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className={clsx(
        "px-5 py-3 font-medium cursor-pointer select-none",
        active ? "text-zinc-100" : "hover:text-zinc-300",
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        <ArrowUpDown
          className={clsx(
            "h-3 w-3 transition-opacity",
            active ? "opacity-100" : "opacity-30",
          )}
        />
        {active && (
          <span className="text-[9px] text-zinc-500">
            {dir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}
