import { getFlaggedCases } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReviewQueue, type ReviewCaseProps } from "@/components/review/ReviewQueue";

export default function ReviewPage() {
  const cases: ReviewCaseProps[] = getFlaggedCases().map((f) => ({
    assessmentId: f.assessment.id,
    employeeId: f.employee.id,
    employeeName: f.employee.name,
    role: f.employee.role,
    siteName: f.site.name,
    shift: f.assessment.shift,
    timestampISO: f.assessment.timestampISO,
    readinessScore: f.assessment.readinessScore,
    reactionTimeMs: f.assessment.metrics.reactionTimeMs,
    focusScore: f.assessment.metrics.focusScore,
    fatigueRisk: f.assessment.metrics.fatigueRisk,
    coordinationScore: f.assessment.metrics.coordinationScore,
    deviationPct: f.assessment.overallDeviationPct,
    status: f.assessment.status,
    reason: f.reason,
    suggestedAction: f.suggestedAction,
    anomalyZ: f.assessment.anomalyZ,
  }));

  return <div><PageHeader title="Supervisor Review Queue" description="Employees in Review or Fail status with AI anomaly context." /><ReviewQueue cases={cases} /></div>;
}
