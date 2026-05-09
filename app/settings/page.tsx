import { Bell, Gauge, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const SETTINGS = [
  {
    title: "Personal-band thresholds",
    description: "Flag when a worker drops outside their own rolling readiness range.",
    value: "12%",
    detail: "review trigger",
    icon: Gauge,
  },
  {
    title: "Supervisor routing",
    description: "Send fail states to the active shift lead and retain escalation state.",
    value: "Live",
    detail: "Pilbara day shift",
    icon: Bell,
  },
  {
    title: "Audit retention",
    description: "Keep screening outcomes, baseline variance, and action state for review.",
    value: "90d",
    detail: "demo policy",
    icon: ShieldCheck,
  },
  {
    title: "Sensitivity profile",
    description: "Balanced model posture for high-throughput worksite screening.",
    value: "Balanced",
    detail: "low friction",
    icon: SlidersHorizontal,
  },
];

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Settings"
        description="Operational controls for thresholds, routing, audit retention, and signal sensitivity."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {SETTINGS.map((item) => {
          const Icon = item.icon;

          return (
            <section key={item.title} className="card-padded">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "var(--nexcorp-green-soft)",
                      border: "1px solid color-mix(in oklch, var(--accent) 24%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
                      {item.title}
                    </h2>
                    <p className="mt-1 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[18px] font-semibold leading-none" style={{ color: "var(--fg)" }}>
                    {item.value}
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.04em]" style={{ color: "var(--fg-subtle)" }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
