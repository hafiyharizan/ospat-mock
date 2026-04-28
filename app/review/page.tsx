import { getFlaggedCases } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReviewQueue, type ReviewCaseProps } from "@/components/review/ReviewQueue";

export default function ResultPage() {
  const cases: ReviewCaseProps[] = getFlaggedCases().map((f) => ({
    assessmentId:     f.assessment.id,
    employeeId:       f.employee.id,
    employeeName:     f.employee.name,
    role:             f.employee.role,
    siteName:         f.site.name,
    shift:            f.assessment.shift,
    timestampISO:     f.assessment.timestampISO,
    readinessScore:   f.assessment.readinessScore,
    reactionTimeMs:   f.assessment.metrics.reactionTimeMs,
    focusScore:       f.assessment.metrics.focusScore,
    fatigueRisk:      f.assessment.metrics.fatigueRisk,
    coordinationScore:f.assessment.metrics.coordinationScore,
    deviationPct:     f.assessment.overallDeviationPct,
    status:           f.assessment.status,
    reason:           f.reason,
    metricReasons:    f.metricReasons,
    suggestedAction:  f.suggestedAction,
    anomalyZ:         f.assessment.anomalyZ,
  }));

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Result"
        description="Workers in Retest or Flag state, compared against their own baseline with clear supervisor action."
      />
      <ReviewQueue cases={cases} />
    </div>
  );
}
