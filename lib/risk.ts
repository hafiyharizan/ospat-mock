import type { AssessmentStatus, BaselineMetrics, MetricSet } from "./types";

export type Tone = "ok" | "warn" | "err";

export function toneColor(tone: Tone | string): string {
  if (tone === "err") return "var(--danger)";
  if (tone === "warn") return "var(--warning)";
  return "var(--success)";
}

export const RESULT_THRESHOLDS = [
  {
    label: "Pass",
    range: "0-7% below baseline",
    description: "Inside the worker's normal personal range.",
    tone: "ok",
  },
  {
    label: "Retest",
    range: "8-17% below baseline",
    description: "Borderline drift. Supervisor check-in or repeat screen is recommended.",
    tone: "warn",
  },
  {
    label: "Flag",
    range: "18%+ below baseline",
    description: "High impairment-risk signal. Do not start high-risk work.",
    tone: "err",
  },
];

export function metricDeviationPct(value: number, baseline: number, invert = false): number {
  if (baseline <= 0) return 0;
  const raw = ((value - baseline) / baseline) * 100;
  return invert ? raw * -1 : raw;
}

export function classifyStatus(
  readinessScore: number,
  fatigueRisk: number,
  anomalyZ: number,
  baselineReadiness = readinessScore,
): AssessmentStatus {
  const baselineDropPct = Math.max(
    0,
    ((baselineReadiness - readinessScore) / Math.max(baselineReadiness, 1)) * 100,
  );

  if (baselineDropPct >= 18 || readinessScore < 58 || fatigueRisk >= 74 || anomalyZ <= -2.2) return "Fail";
  if (baselineDropPct >= 8 || readinessScore < 72 || fatigueRisk >= 62 || anomalyZ <= -1.4) return "Review";
  return "Pass";
}

export function countConsecutiveDeclines(scores: number[]): number {
  if (scores.length < 2) return 0;
  let count = 0;
  for (let i = scores.length - 1; i > 0; i--) {
    if (scores[i] < scores[i - 1]) count++;
    else break;
  }
  return count;
}

export function readinessScore(metrics: MetricSet): number {
  const reactionNorm = Math.max(0, Math.min(100, ((500 - metrics.reactionTimeMs) / 250) * 100));
  const fatigueNorm = Math.max(0, 100 - metrics.fatigueRisk);
  return Number((reactionNorm * 0.3 + metrics.focusScore * 0.25 + fatigueNorm * 0.2 + metrics.coordinationScore * 0.25).toFixed(1));
}

export function metricDeviations(metrics: MetricSet, baseline: BaselineMetrics): MetricSet {
  return {
    reactionTimeMs: Number(metricDeviationPct(metrics.reactionTimeMs, baseline.reactionTimeMs, true).toFixed(1)),
    focusScore: Number(metricDeviationPct(metrics.focusScore, baseline.focusScore).toFixed(1)),
    fatigueRisk: Number(metricDeviationPct(metrics.fatigueRisk, baseline.fatigueRisk, true).toFixed(1)),
    coordinationScore: Number(metricDeviationPct(metrics.coordinationScore, baseline.coordinationScore).toFixed(1)),
  };
}

export function flaggedMetricReasons(metrics: MetricSet, baseline: BaselineMetrics): string[] {
  const reactionSlowerPct = metricDeviationPct(metrics.reactionTimeMs, baseline.reactionTimeMs);
  const accuracyDrop = baseline.focusScore - metrics.focusScore;
  const consistencyDrop = baseline.coordinationScore - metrics.coordinationScore;
  const fatigueIncrease = metrics.fatigueRisk - baseline.fatigueRisk;
  const reasons: string[] = [];

  if (reactionSlowerPct >= 12) reasons.push(`Reaction time ${reactionSlowerPct.toFixed(1)}% slower than baseline`);
  if (accuracyDrop >= 6) reasons.push(`Accuracy ${accuracyDrop.toFixed(1)} points below baseline`);
  if (consistencyDrop >= 8) reasons.push(`Consistency ${consistencyDrop.toFixed(1)} points below baseline`);
  if (fatigueIncrease >= 14) reasons.push(`Fatigue-risk score ${fatigueIncrease.toFixed(1)} points above baseline`);

  return reasons;
}

export function reasonText(
  status: AssessmentStatus,
  readiness: number,
  baselineReadiness: number,
  metricReasons: string[],
): string {
  const baselineDelta = ((readiness - baselineReadiness) / Math.max(baselineReadiness, 1)) * 100;
  const primary = metricReasons[0] ?? `Readiness ${Math.abs(baselineDelta).toFixed(1)}% from personal baseline`;

  if (status === "Fail") {
    return `Flag: ${primary}. Readiness is ${Math.abs(baselineDelta).toFixed(1)}% below this worker's baseline.`;
  }

  if (status === "Review") {
    return `Retest: ${primary}. Supervisor check-in recommended before safety-critical work.`;
  }

  return "Pass: within this worker's personal baseline range.";
}

export function suggestedActionText(status: AssessmentStatus): string {
  if (status === "Fail") return "Do not start high-risk task. Route to supervisor, apply fatigue protocol, and repeat screen in 30 minutes.";
  if (status === "Review") return "Supervisor check-in, low-risk duties if needed, and repeat screen after first break.";
  return "Cleared to begin shift under standard controls.";
}
