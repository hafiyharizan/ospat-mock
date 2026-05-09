"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/live",    label: "Live",      icon: LayoutDashboard },
  { href: "/feed",    label: "People",    icon: Users },
  { href: "/review",  label: "Result",    icon: ClipboardCheck },
  { href: "/sites",   label: "Sites",     icon: Box },
  { href: "/reports", label: "Reports",   icon: Download },
  { href: "/settings",label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const current = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0"
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        height: "100%",
      }}
    >
      {/* Workspace header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-3"
        style={{ borderBottom: "1px solid var(--border-faint)" }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
          style={{ background: "var(--accent)", color: "var(--white)" }}
        >
          N
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-none">
          <span className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
            SHIFT+{" "}
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--fg-faint)", fontWeight: 400 }}
            >
              v0.4
            </span>
          </span>
          <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
            NexCorp AU · Production
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-px">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = current.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-2.5 h-8 text-[13px] transition-colors",
                active
                  ? "font-medium"
                  : "font-normal"
              )}
              style={{
                background: active ? "var(--selected-bg)" : "transparent",
                color: active ? "var(--fg)" : "var(--fg-muted)",
              }}
            >
              <Icon className="h-[15px] w-[15px] flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
              {item.label}
              {item.href === "/" && (
                <span
                  className="ml-auto flex items-center gap-1 font-mono text-[10px]"
                  style={{ color: "var(--success)" }}
                >
                  <span
                    className="h-[5px] w-[5px] rounded-full animate-shift-pulse"
                    style={{ background: "var(--success)" }}
                  />
                  247ms
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className="flex items-center gap-2 px-3.5 py-3"
        style={{ borderTop: "1px solid var(--border-faint)" }}
      >
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
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
          aria-label="Log out"
          title="Log out"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors"
          style={{
            color: "var(--fg-muted)",
            border: "1px solid var(--border)",
            background: "var(--bg-elev)",
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
