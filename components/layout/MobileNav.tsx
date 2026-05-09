"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/live",    label: "Live",     icon: LayoutDashboard },
  { href: "/feed",    label: "People",   icon: Users },
  { href: "/review",  label: "Result",   icon: ClipboardCheck },
  { href: "/sites",   label: "Sites",    icon: Box },
  { href: "/reports", label: "Reports",  icon: Download },
  { href: "/settings",label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const current = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer = open && (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: "var(--bg-overlay)" }}
        onClick={() => setOpen(false)}
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-[82vw] max-w-[300px] flex-col"
        style={{
          background: "var(--bg)",
          borderRight: "1px solid var(--border)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between gap-3 px-4"
          style={{ borderBottom: "1px solid var(--border-faint)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-bold"
              style={{ background: "var(--accent)", color: "var(--white)" }}
            >
              N
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
                SHIFT+
              </span>
              <span className="mt-0.5 font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
                NexCorp AU
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-md"
            style={{ color: "var(--fg-muted)", background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 text-[14px] transition-colors"
                style={{
                  background: active ? "var(--selected-bg)" : "transparent",
                  color: active ? "var(--fg)" : "var(--fg-muted)",
                  fontWeight: active ? 600 : 400,
                  height: 44,
                }}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="flex flex-shrink-0 flex-col gap-3 px-4 py-3"
          style={{ borderTop: "1px solid var(--border-faint)" }}
        >
          <Link
            href="/worker"
            className="flex h-11 items-center justify-center gap-2 rounded-md text-[13.5px] font-semibold"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "var(--shadow-button)",
            }}
          >
            <Plus className="h-4 w-4" />
            New assessment
          </Link>
          <div>
            <div
              className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.05em]"
              style={{ color: "var(--fg-subtle)" }}
            >
              Appearance
            </div>
            <ThemeToggle />
          </div>
          <div
            className="flex items-center gap-2.5 pt-3"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--nexcorp-green-soft)", color: "var(--accent)" }}
            >
              RC
            </div>
            <div className="flex min-w-0 flex-1 flex-col leading-none">
              <span className="text-[12.5px] font-medium truncate" style={{ color: "var(--fg)" }}>
                Reg Cooper
              </span>
              <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                Operator · Pilbara
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium"
              style={{
                color: "var(--fg)",
                border: "1px solid var(--border-strong)",
                background: "var(--bg-elev)",
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md lg:hidden"
        style={{ border: "1px solid var(--border)", background: "var(--bg-elev)" }}
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
      </button>

      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
