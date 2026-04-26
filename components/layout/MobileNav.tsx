"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardCheck, LayoutDashboard, MapPin, Menu, ShieldAlert, X } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Start Here", icon: LayoutDashboard },
  { href: "/feed", label: "Live Assessments", icon: Activity },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/sites", label: "Safety Manager", icon: MapPin },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[84vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.06]">
            <div className="flex h-16 items-center gap-2 px-5 border-b border-zinc-200 dark:border-white/[0.06]">
              <ShieldAlert className="h-4 w-4 text-indigo-400" />
              <div className="leading-tight">
                <div className="text-sm font-semibold">OSPAT</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Guided flow</div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="p-3 space-y-1.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                      active ? "bg-zinc-100 dark:bg-white/5 font-medium" : "text-zinc-600 dark:text-zinc-300",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
