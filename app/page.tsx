import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, ClipboardCheck, ShieldAlert, Users } from "lucide-react";
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
      <PageHeader
        title="OSPAT Workforce Readiness Command Center"
        description="Start here: run today's supervisor workflow, then review 14-day safety trends. Every result is simulated from a 60-second pre-start assessment."
      />

      <section className="panel-padded mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">First-time flow</h2>
            <p className="text-xs text-zinc-500 mt-1">Use this sequence to understand what the platform is doing.</p>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400">Guided workflow</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <GuideCard icon={Users} step="1" title="Check Supervisor Dashboard" desc="Confirm pass/review/fail load for this shift." href="/" />
          <GuideCard icon={ClipboardCheck} step="2" title="Work the Review Queue" desc="Triage flagged workers using fatigue + anomaly context." href="/review" />
          <GuideCard icon={ShieldAlert} step="3" title="Open Safety Manager View" desc="Track 14-day drift and site-level burden." href="/sites" />
        </div>
      </section>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assessments today" value={kpis.totalToday} delta={kpis.trendVsPrevious7Days} hint="vs previous 7 days" />
        <StatCard label="Pass" value={kpis.pass} accent="positive" hint="fit to start shift" />
        <StatCard label="Review" value={kpis.review} accent="warning" hint="monitor + re-test" />
        <StatCard label="Fail" value={kpis.fail} accent="danger" hint="hold from high-risk work" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Readiness trend" subtitle="Average readiness score, last 14 days">
            <TrendLineChart data={getReadinessTrend(14)} />
          </ChartCard>
        </div>
        <div>
          <ChartCard title="Pass / Review / Fail" subtitle="Today's screening outcomes" height="h-56">
            <RiskDonut data={getRiskDistribution()} />
          </ChartCard>
          <div className="-mt-3 panel">
            <RiskDonutLegend data={getRiskDistribution()} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Assessments by site" subtitle="Operational volume today">
          <SiteBarChart data={getAssessmentsBySite()} />
        </ChartCard>
        <ChartCard title="Flagged by shift" subtitle="Review + Fail">
          <ShiftStackedBar data={getFlaggedByShift()} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel-padded">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <BrainCircuit className="h-3.5 w-3.5" />
            AI implementation (simple)
          </div>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            Each employee has a rolling 12-test baseline. The AI computes z-score drift on readiness: <strong>Watch at ≤ -1.4</strong>,
            <strong> Escalate at ≤ -2.2</strong>. This is explainable and suitable for MVP rollout.
          </p>
        </div>
        <div className="panel-padded">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Next action</h3>
          <p className="text-xs text-zinc-500 mt-1">Need a shift-ready checklist? Move directly into flagged workers now.</p>
          <Link href="/review" className="btn-primary mt-4 w-full sm:w-auto">
            Open Review Queue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/sites" className="btn-ghost mt-2 w-full sm:w-auto sm:ml-2">
            Safety Manager Dashboard
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ icon: Icon, step, title, desc, href }: { icon: React.ComponentType<{ className?: string }>; step: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:border-indigo-300/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Step {step}</span>
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1">{desc}</p>
    </Link>
  );
}
