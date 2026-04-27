"use client";

import { Search, Plus, ChevronRight } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { usePathname } from "next/navigation";

const BREADCRUMBS: Record<string, { region: string; section: string }> = {
  "/live":    { region: "Pilbara", section: "Live" },
  "/feed":    { region: "Pilbara", section: "People" },
  "/review":  { region: "Pilbara", section: "Patterns" },
  "/sites":   { region: "Pilbara", section: "Sites" },
  "/reports": { region: "Pilbara", section: "Reports" },
  "/settings":{ region: "Pilbara", section: "Settings" },
};

export function Topbar() {
  const pathname = usePathname();
  const current = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";
  const crumb = BREADCRUMBS[current] ?? { region: "Pilbara", section: "OSPAT+" };

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center gap-4 px-6"
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
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="text-[13px]" style={{ color: "var(--fg-subtle)" }}>
          {crumb.region}
        </span>
        <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "var(--fg-faint)" }} />
        <span className="text-[13px]" style={{ color: "var(--fg-subtle)" }}>
          Day shift · 06:00
        </span>
        <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "var(--fg-faint)" }} />
        <span className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
          {crumb.section}
        </span>
      </div>

      {/* Search */}
      <div
        className="hidden md:flex items-center gap-2 h-8 w-72 rounded-md px-3"
        style={{
          background: "var(--bg-sunken)",
          border: "1px solid var(--border)",
          color: "var(--fg-subtle)",
          fontSize: 13,
        }}
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1">Search workers, sites, cases…</span>
        <span className="font-mono text-[11px]" style={{ color: "var(--fg-faint)" }}>⌘K</span>
      </div>

      {/* Stream badge */}
      <div
        className="hidden sm:inline-flex items-center gap-1.5 h-[26px] rounded-md px-2.5 font-mono text-[11.5px]"
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
      <span className="hidden md:block font-mono text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
        06:42 AWST
      </span>

      {/* New case */}
      <button
        className="inline-flex items-center gap-1.5 h-8 rounded-md px-3 text-[12px] font-medium"
        style={{
          background: "var(--accent)",
          color: "var(--accent-fg)",
          boxShadow: "var(--shadow-button)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        New case
      </button>
    </header>
  );
}
