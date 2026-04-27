"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  BrainCircuit,
  Download,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/live",    label: "Live",     icon: LayoutDashboard },
  { href: "/feed",    label: "People",   icon: Users },
  { href: "/review",  label: "Patterns", icon: BrainCircuit },
  { href: "/sites",   label: "Sites",    icon: Box },
  { href: "/reports", label: "Reports",  icon: Download },
  { href: "/settings",label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md lg:hidden"
        style={{ border: "1px solid var(--border)", background: "var(--bg-elev)" }}
      >
        <Menu className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "var(--bg-overlay)" }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 w-64 flex flex-col"
            style={{ background: "var(--bg)", borderRight: "1px solid var(--border)" }}
          >
            <div
              className="flex h-14 items-center justify-between gap-3 px-4"
              style={{ borderBottom: "1px solid var(--border-faint)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
                  style={{ background: "var(--neutral-900)", color: "var(--white)" }}
                >
                  O
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                  OSPAT+
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ color: "var(--fg-muted)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-2 flex flex-col gap-px">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = current.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-2.5 h-9 text-[13px] transition-colors"
                    style={{
                      background: active ? "var(--selected-bg)" : "transparent",
                      color: active ? "var(--fg)" : "var(--fg-muted)",
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
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
