import Link from "next/link";
import {
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const ROLES = [
  {
    id: "operations",
    label: "Operations Console",
    description: "Admin, supervisor, and HR workspace for live readiness, trends, sites, and review queues.",
    icon: LayoutDashboard,
    href: "/live",
    accent: "var(--accent)",
    badge: "Admin / Supervisor / HR",
  },
  {
    id: "worker",
    label: "Worker",
    description: "Your 60-second pre-shift check-in. Follow the dot.",
    icon: Users,
    href: "/worker",
    accent: "var(--warning)",
    badge: "Check-in",
  },
];

export default function RoleSelectorPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 72% 44% at 50% -18%, rgba(0,168,90,0.16), transparent), url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60' fill='none' stroke='rgba(5,5,5,0.045)' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: "auto, 60px 60px",
        }}
      />

      <header
        className="relative z-10 flex h-[88px] items-center px-4 sm:h-[96px] sm:px-10"
        style={{
          background: "var(--bg-elev)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-[26px] font-black leading-none sm:h-12 sm:w-12 sm:rounded-[9px] sm:text-[31px]"
            style={{ background: "var(--accent)", color: "var(--white)", boxShadow: "0 0 18px color-mix(in oklch, var(--accent) 50%, transparent)" }}
            aria-hidden="true"
          >
            N
          </div>
          <div
            className="nexcorp-heading max-w-[185px] truncate text-[22px] font-black uppercase leading-none tracking-[-0.04em] sm:max-w-none sm:text-[40px]"
            style={{ color: "var(--fg)" }}
          >
            NexCorp<span className="align-top text-[13px] tracking-normal">TM</span>
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <ThemeToggle />
        </div>
      </header>

      <section className="relative z-10 flex min-h-[calc(100svh-88px)] items-center justify-center px-4 py-10 sm:min-h-[calc(100svh-96px)] sm:px-6 sm:py-14">
        <div className="w-full max-w-3xl">
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center justify-center gap-3">
              <div
                className="brand-ring flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: "var(--nexcorp-green-soft)",
                  color: "var(--accent)",
                  border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
                }}
              >
                <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span
                className="text-[34px] font-black uppercase tracking-[-0.045em] sm:text-[38px]"
                style={{ color: "var(--fg)" }}
              >
                <span className="shift-shimmer">SHIFT</span><span style={{ color: "var(--accent)" }}>+</span>
              </span>
            </div>
            <p
              className="mx-auto max-w-2xl text-[28px] font-semibold leading-tight tracking-[-0.025em] sm:text-[42px]"
              style={{ color: "var(--fg)" }}
            >
              Multi-factor fitness-for-work testing in 60 seconds
            </p>
            <span
              className="mx-auto mt-5 block max-w-xl text-[16px] leading-7 sm:text-[18px]"
              style={{ color: "var(--fg-muted)" }}
            >
              Select a role group to view operational readiness or start the worker check-in.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.id}
                  href={role.href}
                  className="group relative flex flex-col gap-4 rounded-lg p-5 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-elev)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 24% 18%, color-mix(in oklch, ${role.accent} 12%, transparent), transparent 62%)`,
                      border: `1px solid color-mix(in oklch, ${role.accent} 34%, transparent)`,
                      borderRadius: "inherit",
                    }}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-md"
                      style={{
                        background: `color-mix(in oklch, ${role.accent} 11%, var(--bg-elev))`,
                        border: `1px solid color-mix(in oklch, ${role.accent} 28%, transparent)`,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: role.accent }}
                        strokeWidth={1.9}
                      />
                    </div>

                    <ChevronRight
                      className="mt-1 h-4 w-4 flex-shrink-0 opacity-35 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-80"
                      style={{ color: "var(--fg-subtle)" }}
                    />
                  </div>

                  <div className="relative">
                    <div
                      className="flex flex-wrap items-center gap-2 text-[16px] font-semibold"
                      style={{ color: "var(--fg)" }}
                    >
                      {role.label}
                      {role.badge && (
                        <span
                          className="rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.03em]"
                          style={{
                            color: role.accent,
                            background: `color-mix(in oklch, ${role.accent} 10%, transparent)`,
                            border: `1px solid color-mix(in oklch, ${role.accent} 26%, transparent)`,
                          }}
                        >
                          {role.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 text-[13px] leading-relaxed"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {role.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--success)" }} />
              <p className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                Prototype demo · No real worker data · All results simulated
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
