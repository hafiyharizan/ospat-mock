import Link from "next/link";
import {
  getAssessmentsBySite,
  getDashboardKpis,
  getFlaggedByShift,
  getReadinessTrend,
  getRiskDistribution,
} from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { RiskDonut, RiskDonutLegend } from "@/components/charts/RiskDonut";
import { SiteBarChart } from "@/components/charts/SiteBarChart";
import { ShiftStackedBar } from "@/components/charts/ShiftStackedBar";
import { ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  const trend = getReadinessTrend(14);
  const dist = getRiskDistribution();
  const bySite = getAssessmentsBySite();
  const byShift = getFlaggedByShift();

  return (
    <div>
      <PageHeader
        title="Operations Overview"
        description="Workforce readiness signals across all sites for today."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assessments today"
          value={kpis.totalToday}
          delta={kpis.trendVsPrevious7Days}
          hint="vs. prior 7-day average"
        />
        <StatCard
          label="Cleared for shift"
          value={kpis.cleared}
          accent="positive"
          hint={`${kpis.totalToday > 0 ? Math.round((kpis.cleared / kpis.totalToday) * 100) : 0}% of today's assessments`}
        />
        <StatCard
          label="Flagged for review"
          value={kpis.flagged}
          accent="danger"
          hint="Monitor + Review Required"
        />
        <StatCard
          label="Average readiness"
          value={kpis.avgScore.toFixed(1)}
          accent="warning"
          hint="0–100 scale"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Readiness trend"
            subtitle="Average score, last 14 days"
          >
            <TrendLineChart data={trend} />
          </ChartCard>
        </div>
        <div>
          <ChartCard
            title="Risk distribution"
            subtitle="Today"
            height="h-56"
          >
            <RiskDonut data={dist} />
          </ChartCard>
          <div className="-mt-3 panel">
            <RiskDonutLegend data={dist} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Assessments by site"
          subtitle="Today's volume across operations"
        >
          <SiteBarChart data={bySite} />
        </ChartCard>
        <ChartCard
          title="Flagged cases by shift"
          subtitle="Monitor + Review Required, today"
        >
          <ShiftStackedBar data={byShift} />
        </ChartCard>
      </div>

      <div className="mt-6 panel-padded">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">High-risk sites</h3>
            <p className="text-xs text-zinc-500">
              Sites with the most flagged cases today
            </p>
          </div>
          <Link
            href="/sites"
            className="btn-ghost text-xs"
          >
            View all sites
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {kpis.highRiskSites.length === 0 ? (
          <div className="text-sm text-zinc-500 py-6 text-center">
            No flagged cases today. All sites are clear.
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {kpis.highRiskSites.map((s, i) => (
              <li
                key={s.siteId}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-400/10 text-rose-300 text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">
                      {s.siteName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {s.flagged} flagged today
                    </div>
                  </div>
                </div>
                <Link
                  href="/sites"
                  className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1"
                >
                  Drill in
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
