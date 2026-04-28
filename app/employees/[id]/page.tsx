import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, MapPin, User } from "lucide-react";
import { getEmployeeDetail, getEmployees } from "@/lib/data";
import { ChartCard } from "@/components/charts/ChartCard";
import { EmployeeScoreChart } from "@/components/charts/EmployeeScoreChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { readinessScore } from "@/lib/risk";
import type { AssessmentStatus } from "@/lib/types";

export function generateStaticParams() {
  return getEmployees().map((e) => ({ id: e.id }));
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getEmployeeDetail(id);
  if (!detail) notFound();

  const chartData = detail.recent.map((a, idx) => ({
    idx,
    score: a.readinessScore,
    label: a.timestampISO.slice(5, 10),
  }));
  const readinessBaseline = readinessScore(detail.employee.baseline);

  const dotColor = (status: AssessmentStatus) =>
    status === "Pass" ? "var(--success)" : status === "Review" ? "var(--warning)" : "var(--danger)";

  return (
    <div className="p-4 sm:p-6">
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] transition-colors"
        style={{ color: "var(--fg-subtle)" }}
      >
        <ArrowLeft className="h-3 w-3" />
        Back to people
      </Link>

      {/* Header card */}
      <div className="card-padded mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
              style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
            >
              <User className="h-5 w-5" style={{ color: "var(--fg-subtle)" }} />
            </div>
            <div className="min-w-0">
              <h1
                className="truncate text-[24px] font-semibold leading-tight sm:text-[26px]"
                style={{ color: "var(--fg)", letterSpacing: "-0.016em" }}
              >
                {detail.employee.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                <span>{detail.employee.role}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {detail.site.name}
                </span>
                <span>{detail.employee.primaryShift} shift</span>
              </div>
            </div>
          </div>
          <StatusBadge level={detail.latest.status} />
        </div>
      </div>

      {/* KPI grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Readiness", value: detail.latest.readinessScore.toFixed(1) },
          { label: "Personal baseline", value: readinessBaseline.toFixed(1) },
          { label: "Reaction (ms)", value: detail.latest.metrics.reactionTimeMs },
          { label: "Deviation", value: `${detail.latest.overallDeviationPct.toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="card-padded flex flex-col gap-2">
            <div className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>{label}</div>
            <div
              className="font-mono text-[26px] font-semibold leading-none"
              style={{ color: "var(--fg)", letterSpacing: "-0.01em", fontFeatureSettings: '"tnum"' }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <InsightCard text={detail.insight} level={detail.latest.status} />

      {/* Chart + timeline */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Personal readiness history" subtitle="Last 20 check-ins vs this worker's own baseline">
            <EmployeeScoreChart data={chartData} baseline={readinessBaseline} />
          </ChartCard>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border-faint)" }}>
            <h3 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>Timeline</h3>
          </div>
          <ul className="max-h-80 overflow-y-auto px-5 py-3 flex flex-col gap-3">
            {[...detail.recent].reverse().slice(0, 12).map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: dotColor(a.status) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
                      {formatDateTime(a.timestampISO)}
                    </span>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                      {a.readinessScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="font-mono text-[11px]" style={{ color: "var(--fg-faint)" }}>
                    {a.status} · z {a.anomalyZ.toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ text, level }: { text: string; level: AssessmentStatus }) {
  const borderColor = level === "Fail" ? "var(--danger)" : level === "Review" ? "var(--warning)" : "var(--success)";
  return (
    <div
      className="flex items-start gap-3 rounded-lg p-4 mb-0"
      style={{
        border: `1px solid color-mix(in oklch, ${borderColor} 25%, transparent)`,
        background: `color-mix(in oklch, ${borderColor} 8%, var(--bg))`,
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
      >
        <Lightbulb className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
      </div>
      <div>
        <div className="eyebrow mb-1">AI insight</div>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{text}</p>
      </div>
    </div>
  );
}
