import Link from "next/link";
import { ArrowUpRight, BrainCircuit } from "lucide-react";
import { getAssessmentsBySite, getDashboardKpis, getFlaggedByShift, getReadinessTrend, getRiskDistribution } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { RiskDonut, RiskDonutLegend } from "@/components/charts/RiskDonut";
import { SiteBarChart } from "@/components/charts/SiteBarChart";
import { ShiftStackedBar } from "@/components/charts/ShiftStackedBar";

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  return (
    <div>
      <PageHeader title="Supervisor Dashboard · Today" description="60-second fitness-for-work screening with reaction, focus, fatigue, coordination, and AI anomaly scoring." />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assessments today" value={kpis.totalToday} delta={kpis.trendVsPrevious7Days} hint="vs previous 7 days" />
        <StatCard label="Pass" value={kpis.pass} accent="positive" hint="fit to start shift" />
        <StatCard label="Review" value={kpis.review} accent="warning" hint="monitor + re-test" />
        <StatCard label="Fail" value={kpis.fail} accent="danger" hint="hold from high-risk work" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartCard title="Readiness trend" subtitle="Average readiness score, 14 days"><TrendLineChart data={getReadinessTrend(14)} /></ChartCard></div>
        <div><ChartCard title="Pass/Review/Fail" subtitle="Today" height="h-56"><RiskDonut data={getRiskDistribution()} /></ChartCard><div className="-mt-3 panel"><RiskDonutLegend data={getRiskDistribution()} /></div></div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Assessments by site" subtitle="Operational volume today"><SiteBarChart data={getAssessmentsBySite()} /></ChartCard>
        <ChartCard title="Flagged by shift" subtitle="Review + Fail"><ShiftStackedBar data={getFlaggedByShift()} /></ChartCard>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel-padded"><div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500"><BrainCircuit className="h-3.5 w-3.5" />AI implementation (simple)</div><p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">Per-employee anomaly detection uses rolling 12-test readiness z-scores. Watch starts at z ≤ -1.4 and Escalate at z ≤ -2.2. This can be replaced by a lightweight time-series model using shift history, sleep proxy, and cumulative load.</p></div>
        <div className="panel-padded"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Safety manager view</h3><p className="text-xs text-zinc-500">Strategic 14-day trend and site drift</p></div><Link href="/sites" className="btn-ghost text-xs">Open dashboard <ArrowUpRight className="h-3.5 w-3.5" /></Link></div></div>
      </div>
    </div>
  );
}
