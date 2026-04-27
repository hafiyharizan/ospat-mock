import Link from "next/link";
import {
  Activity,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    description: "Full operations centre — all sites, all signals, all workers.",
    icon: LayoutDashboard,
    href: "/live",
    accent: "var(--accent)",
  },
  {
    id: "supervisor",
    label: "Supervisor",
    description: "Live wave, flagged workers, and one-click supervisor routing.",
    icon: Activity,
    href: "/live",
    accent: "var(--success)",
  },
  {
    id: "hr",
    label: "HR",
    description: "People patterns, workforce trends, and compliance history.",
    icon: BarChart3,
    href: "/feed",
    accent: "var(--info)",
  },
  {
    id: "worker",
    label: "Worker",
    description: "Your 60-second pre-shift check-in. Follow the dot.",
    icon: Users,
    href: "/worker",
    accent: "var(--warning)",
    mobile: true,
  },
];

export default function RoleSelectorPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--slate-900, #0a0e14)" }}
    >
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(47,111,237,0.15), transparent), url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: "auto, 60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold"
              style={{ background: "var(--accent)", color: "var(--white)" }}
            >
              O
            </div>
            <span
              className="text-[32px] font-semibold tracking-tight"
              style={{ color: "#ececea" }}
            >
              OSPAT<span style={{ color: "var(--accent)" }}>+</span>
            </span>
          </div>
          <p className="font-mono text-[13px]" style={{ color: "#5f656c" }}>
            Occupational Safety Performance Assessment · Permaconn AU · v0.4
          </p>
          <h1
            className="mt-4 text-[22px] font-semibold"
            style={{ color: "#b0b3b8", letterSpacing: "-0.01em" }}
          >
            Select your role to continue
          </h1>
        </div>

        {/* Role cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                href={role.href}
                className="group relative flex flex-col gap-4 rounded-xl p-5 transition-all duration-200"
                style={{
                  background: "#14171b",
                  border: "1px solid #23272d",
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, color-mix(in oklch, ${role.accent} 8%, transparent), transparent 70%)`,
                    border: `1px solid color-mix(in oklch, ${role.accent} 30%, transparent)`,
                    borderRadius: "inherit",
                  }}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in oklch, ${role.accent} 12%, #14171b)`,
                      border: `1px solid color-mix(in oklch, ${role.accent} 25%, transparent)`,
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: role.accent }}
                      strokeWidth={1.75}
                    />
                  </div>

                  <ChevronRight
                    className="h-4 w-4 mt-1 flex-shrink-0 opacity-30 transition-all duration-200 group-hover:opacity-80 group-hover:translate-x-0.5"
                    style={{ color: "#b0b3b8" }}
                  />
                </div>

                <div className="relative">
                  <div
                    className="flex items-center gap-2 text-[16px] font-semibold"
                    style={{ color: "#ececea" }}
                  >
                    {role.label}
                    {role.mobile && (
                      <span
                        className="font-mono text-[10px] font-medium"
                        style={{
                          color: role.accent,
                          background: `color-mix(in oklch, ${role.accent} 12%, transparent)`,
                          border: `1px solid color-mix(in oklch, ${role.accent} 25%, transparent)`,
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        MOBILE
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1 text-[13px] leading-relaxed"
                    style={{ color: "#8a8f95" }}
                  >
                    {role.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer disclaimer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--success)" }} />
            <p className="font-mono text-[11px]" style={{ color: "#5f656c" }}>
              This is a prototype demo · No real worker data · All results simulated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
