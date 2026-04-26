"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardCheck, LayoutDashboard, MapPin, ShieldAlert } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Start Here", hint: "Overview + workflow", icon: LayoutDashboard },
  { href: "/feed", label: "Live Assessments", hint: "Real-time screening", icon: Activity },
  { href: "/review", label: "Review Queue", hint: "Supervisor actions", icon: ClipboardCheck },
  { href: "/sites", label: "Safety Manager", hint: "14-day strategic view", icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:border-r lg:border-zinc-200 dark:lg:border-white/[0.06] lg:bg-white/90 dark:lg:bg-zinc-950/70 lg:backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">OSPAT</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400">Fitness-for-work</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm",
                active ? "bg-zinc-100 dark:bg-white/5" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4 mt-0.5" />
              <span>
                <div className="font-medium text-zinc-900 dark:text-white">{item.label}</div>
                <div className="text-[11px] text-zinc-500">{item.hint}</div>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
