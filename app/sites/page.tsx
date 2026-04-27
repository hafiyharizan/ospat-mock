import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { getSiteSummaries } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function SitesPage() {
  const sites = getSiteSummaries();

  return (
    <div className="p-6">
      <PageHeader
        title="Sites"
        description="Readiness drift, flagged burden, and riskiest shift by operating location · 14-day window."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {sites.map((site) => {
          const positive = site.trend14d > 0;
          const negative = site.trend14d < 0;
          const TrendIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
          const sparkColor = positive ? "var(--success)" : negative ? "var(--danger)" : "var(--warning)";
          const trendTone = positive ? "ok" : negative ? "err" : "warn";

          return (
            <div key={site.siteId} className="card-padded">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow mb-1.5">{site.region}</div>
                  <h3
                    className="text-[22px] font-semibold leading-tight"
                    style={{ color: "var(--fg)", letterSpacing: "-0.015em" }}
                  >
                    {site.siteName}
                  </h3>
                  <p className="mt-0.5 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                    {site.type}
                  </p>
                </div>

                <div
                  className={`badge badge-${trendTone}`}
                  style={{ height: 28, padding: "0 10px", fontSize: 12 }}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(site.trend14d).toFixed(1)}%
                  <span className="text-[10px] opacity-70 ml-1">14d</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                <Metric label="Today" value={site.assessments} />
                <Metric
                  label="Flagged"
                  value={site.flagged}
                  danger={site.flagged > 0}
                />
                <Metric label="Avg score" value={site.avgReadiness.toFixed(1)} />
                <Metric label="Risk shift" value={site.highestRiskShift} />
              </div>

              <div className="mt-4">
                <MiniSparkline values={site.recentScores} color={sparkColor} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div
        className="font-mono text-[22px] font-semibold leading-none"
        style={{
          color: danger ? "var(--danger)" : "var(--fg)",
          fontFeatureSettings: '"tnum"',
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
