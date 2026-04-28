import { Clock, Database, Download, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  TODAY_ISO,
  getDashboardKpis,
  getFeedRows,
  getFlaggedCases,
  getSiteSummaries,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";

const EXPORTS = [
  {
    title: "Shift summary",
    description: "Pass, retest, and flag totals by site and shift.",
    format: "CSV",
  },
  {
    title: "Supervisor action log",
    description: "Acknowledgements, review decisions, and escalation notes.",
    format: "PDF",
  },
  {
    title: "Personal baseline variance",
    description: "Worker-by-worker deviation from their own historical range.",
    format: "CSV",
  },
  {
    title: "90-day audit pack",
    description: "Compliance-ready archive for HR and safety review.",
    format: "ZIP",
  },
];

export default function ReportsPage() {
  const kpis = getDashboardKpis();
  const flaggedCases = getFlaggedCases();
  const sites = getSiteSummaries();
  const feedRows = getFeedRows();
  const today = TODAY_ISO.slice(0, 10);
  const todayRows = feedRows.filter((row) => row.timestampISO.startsWith(today));
  const failCases = flaggedCases.filter((item) => item.assessment.status === "Fail");
  const retestCases = flaggedCases.filter((item) => item.assessment.status === "Review");

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Reports"
        description="Audit-ready records for shift screening, supervisor escalation, and personal-baseline variance."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric
          label="Screened today"
          value={kpis.totalToday}
          detail={`${todayRows.length} records retained`}
          icon={Database}
        />
        <ReportMetric
          label="Retest"
          value={kpis.review}
          detail={`${retestCases.length} routed for check-in`}
          icon={Clock}
        />
        <ReportMetric
          label="Flag"
          value={kpis.fail}
          detail={`${failCases.length} supervisor escalations`}
          icon={ShieldCheck}
          tone="danger"
        />
        <ReportMetric
          label="Sites"
          value={sites.length}
          detail="daily summaries ready"
          icon={FileText}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderBottom: "1px solid var(--border-faint)" }}>
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
                Escalation audit trail
              </h2>
              <p className="mt-0.5 font-mono text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
                Supervisor-visible outcomes, not impairment diagnosis
              </p>
            </div>
            <button className="btn-secondary h-[30px] w-full justify-center px-3 text-[12px] sm:w-auto">
              <Download className="h-3.5 w-3.5" />
              Export log
            </button>
          </div>

          <div className="hidden gap-3 px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] md:grid md:grid-cols-[1.1fr_1fr_92px_1.5fr]" style={{ background: "var(--bg-sunken)", borderBottom: "1px solid var(--border)", color: "var(--fg-subtle)" }}>
            <div>Worker</div>
            <div>Site / shift</div>
            <div>Status</div>
            <div>Required action</div>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {flaggedCases.slice(0, 8).map((item) => (
              <div
                key={item.assessment.id}
                className="grid grid-cols-1 gap-2 px-5 py-3 text-[13px] md:grid-cols-[1.1fr_1fr_92px_1.5fr] md:items-center md:gap-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium" style={{ color: "var(--fg)" }}>
                    {item.employee.name}
                  </div>
                  <div className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                    {formatDateTime(item.assessment.timestampISO)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate" style={{ color: "var(--fg-muted)" }}>
                    {item.site.name}
                  </div>
                  <div className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                    {item.assessment.shift} shift
                  </div>
                </div>
                <StatusBadge level={item.assessment.status} />
                <div className="text-[12.5px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                  {item.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-3">
          <div className="card-padded">
            <div className="eyebrow">Available exports</div>
            <div className="mt-3 flex flex-col gap-2">
              {EXPORTS.map((item) => (
                <button
                  key={item.title}
                  className="group flex items-center gap-3 rounded-lg p-3 text-left transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{ background: "var(--permaconn-green-soft)", color: "var(--accent)" }}
                  >
                    <Download className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                      {item.description}
                    </span>
                  </span>
                  <span className="font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
                    {item.format}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-padded">
            <div className="eyebrow">Audit posture</div>
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Each record stores the worker, site, shift, timestamp, result band, baseline deviation, and supervisor action state.
            </p>
            <div className="mt-4 rounded-lg p-3" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}>
              <div className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                Retention window
              </div>
              <div className="mt-1 text-[22px] font-semibold leading-none" style={{ color: "var(--fg)" }}>
                90 days
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--fg-muted)" }}>
                Demo policy for HR and safety review.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReportMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Database;
  tone?: "default" | "danger";
}) {
  const color = tone === "danger" ? "var(--danger)" : "var(--accent)";

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
          {label}
        </span>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="mt-3 font-mono text-[28px] font-semibold leading-none" style={{ color: "var(--fg)" }}>
        {value}
      </div>
      <div className="mt-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
        {detail}
      </div>
    </div>
  );
}
