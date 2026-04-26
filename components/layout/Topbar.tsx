"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { DemoBadge } from "./DemoBadge";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

const TITLES: Record<string, string> = {
  "/": "Start Here",
  "/feed": "Live Assessments",
  "/review": "Supervisor Review",
  "/sites": "Safety Manager",
};

export function Topbar() {
  const pathname = usePathname();
  const view = TITLES[pathname] ?? "Workforce Readiness";

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 dark:border-white/[0.06] px-4 sm:px-5">
        <MobileNav />

        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">OSPAT Platform</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{view}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-6 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input disabled placeholder="Search employees, sites, shifts…" className="input pl-9 cursor-not-allowed opacity-70" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <DemoBadge />
        </div>
      </div>
    </header>
  );
}
