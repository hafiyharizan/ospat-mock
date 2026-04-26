"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  MapPin,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/feed", label: "Live Feed", icon: Activity },
  { href: "/sites", label: "Sites", icon: MapPin },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.06] flex flex-col shadow-2xl animate-slide-in"
          >
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
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
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
        </div>
      )}
    </>
  );
}

