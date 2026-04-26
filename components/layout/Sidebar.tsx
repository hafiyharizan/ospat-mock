"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/feed", label: "Live Feed", icon: Activity },
  { href: "/sites", label: "Sites", icon: MapPin },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:flex-col lg:border-r lg:border-zinc-200 dark:lg:border-white/[0.06] lg:bg-white/90 dark:lg:bg-zinc-950/70 lg:backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">OSPAT</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Insights Concept
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-white/5 dark:text-white dark:shadow-card"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100",
              )}
            >
              <Icon
                className={clsx(
                  "h-4 w-4",
                  active ? "text-indigo-500 dark:text-indigo-300" : "text-zinc-400 dark:text-zinc-500",
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px] shadow-indigo-400/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-200 dark:border-white/[0.06]">
        <div className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Concept build
        </div>
        <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          v0.1 · MVP preview
        </div>
      </div>
    </aside>
  );
}

