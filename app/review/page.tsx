import { getFlaggedCases } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReviewQueue, type ReviewCaseProps } from "@/components/review/ReviewQueue";

export default function ReviewPage() {
  const flagged = getFlaggedCases();
  const cases: ReviewCaseProps[] = flagged.map((f) => ({
    assessmentId: f.assessment.id,
    employeeId: f.employee.id,
    employeeName: f.employee.name,
    role: f.employee.role,
    siteName: f.site.name,
    shift: f.assessment.shift,
    timestampISO: f.assessment.timestampISO,
    score: f.assessment.score,
    baseline: f.employee.baseline,
    deviationPct: f.assessment.deviationPct,
    riskLevel: f.assessment.riskLevel,
    reason: f.reason,
    suggestedAction: f.suggestedAction,
  }));

  return (
    <div>
      <PageHeader
        title="Supervisor Review Queue"
        description="Cases requiring supervisor attention. Acknowledge to take ownership; mark reviewed once resolved."
      />
      <ReviewQueue cases={cases} />
    </div>
  );
}
