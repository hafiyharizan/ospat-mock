"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, ChevronRight } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { getFeedRows } from "@/lib/data";

const BREADCRUMBS: Record<string, { region: string; section: string }> = {
  "/live":    { region: "Pilbara", section: "Live" },
  "/feed":    { region: "Pilbara", section: "People" },
  "/review":  { region: "Pilbara", section: "Result" },
  "/sites":   { region: "Pilbara", section: "Sites" },
  "/reports": { region: "Pilbara", section: "Reports" },
  "/settings":{ region: "Pilbara", section: "Settings" },
};

function findSearchResults(term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];

  const seen = new Set<string>();
  return getFeedRows()
    .filter((row) => {
      const haystack = [
        row.employeeName,
        row.employeeId,
        row.siteName,
        row.role,
        row.status === "Review" ? "Retest" : row.status === "Fail" ? "Flag" : "Pass",
      ].join(" ").toLowerCase();
      return haystack.includes(normalized);
    })
    .filter((row) => {
      if (seen.has(row.employeeId)) return false;
      seen.add(row.employeeId);
      return true;
    })
    .slice(0, 5);
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const current = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";
  const crumb = BREADCRUMBS[current] ?? { region: "Pilbara", section: "OSPAT+" };
  const searchResults = useMemo(() => findSearchResults(query), [query]);

  const openFirstResult = (term = query) => {
    const first = findSearchResults(term)[0];
    if (!first) return;
    setQuery("");
    setFocused(false);
    router.push(`/employees/${first.employeeId}`);
  };

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center gap-2 px-3 sm:gap-4 sm:px-6"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in oklch, var(--bg) 80%, transparent)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile nav toggle */}
      <MobileNav />

      {/* Breadcrumb */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="hidden text-[13px] sm:inline" style={{ color: "var(--fg-subtle)" }}>
          {crumb.region}
        </span>
        <ChevronRight className="hidden h-3 w-3 flex-shrink-0 sm:block" style={{ color: "var(--fg-faint)" }} />
        <span className="hidden text-[13px] md:inline" style={{ color: "var(--fg-subtle)" }}>
          Day shift · 06:00
        </span>
        <ChevronRight className="hidden h-3 w-3 flex-shrink-0 md:block" style={{ color: "var(--fg-faint)" }} />
        <span className="truncate text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
          {crumb.section}
        </span>
      </div>

      {/* Search */}
      <div className="relative hidden lg:block">
        <div
          className="flex h-8 w-64 items-center gap-2 rounded-md px-3 xl:w-72"
          style={{
            background: "var(--bg-sunken)",
            border: "1px solid var(--border)",
            color: "var(--fg-subtle)",
            fontSize: 13,
          }}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onKeyDown={(event) => {
              if (event.key === "Enter") openFirstResult(event.currentTarget.value);
              if (event.key === "Escape") {
                setQuery("");
                setFocused(false);
                inputRef.current?.blur();
              }
            }}
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="Search worker, result, site..."
            style={{ color: "var(--fg)" }}
            aria-label="Search worker, result, site"
          />
          <span className="font-mono text-[11px]" style={{ color: "var(--fg-faint)" }}>⌘K</span>
        </div>

        {focused && query.trim() && (
          <div
            className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-lg"
            style={{
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {searchResults.length ? (
              searchResults.map((row) => (
                <Link
                  key={row.employeeId}
                  href={`/employees/${row.employeeId}`}
                  onClick={() => {
                    setQuery("");
                    setFocused(false);
                  }}
                  className="block px-3 py-2.5 transition-colors hover:bg-[var(--selected-bg)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[13px] font-medium" style={{ color: "var(--fg)" }}>
                      {row.employeeName}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                      {row.status === "Review" ? "Retest" : row.status === "Fail" ? "Flag" : "Pass"}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
                    {row.role} · {row.siteName}
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                No workers, results, or sites match "{query}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stream badge */}
      <div
        className="hidden h-[26px] items-center gap-1.5 rounded-md px-2.5 font-mono text-[11.5px] xl:inline-flex"
        style={{
          background: "color-mix(in oklch, var(--success) 10%, var(--bg))",
          border: "1px solid color-mix(in oklch, var(--success) 30%, transparent)",
          color: "var(--success)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full animate-ospat-pulse"
          style={{ background: "var(--success)" }}
        />
        STREAM · 247 ms
      </div>

      {/* Clock */}
      <span className="hidden font-mono text-[11.5px] xl:block" style={{ color: "var(--fg-subtle)" }}>
        06:42 AWST
      </span>

      <div className="hidden shrink-0 sm:block">
        <ThemeToggle />
      </div>

      {/* New assessment */}
      <Link
        href="/worker"
        className="hidden h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium sm:inline-flex"
        style={{
          background: "var(--accent)",
          color: "var(--accent-fg)",
          boxShadow: "var(--shadow-button)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        New assessment
      </Link>
    </header>
  );
}
