import type { AssessmentStatus, BaselineMetrics, MetricSet } from "./types";

export function metricDeviationPct(value: number, baseline: number, invert = false): number {
  if (baseline <= 0) return 0;
  const raw = ((value - baseline) / baseline) * 100;
  return invert ? raw * -1 : raw;
}

export function classifyStatus(readinessScore: number, fatigueRisk: number, anomalyZ: number): AssessmentStatus {
  if (readinessScore < 58 || fatigueRisk >= 74 || anomalyZ <= -2.2) return "Fail";
  if (readinessScore < 72 || fatigueRisk >= 62 || anomalyZ <= -1.4) return "Review";
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

export function reasonText(status: AssessmentStatus, readiness: number, anomalyZ: number): string {
  if (status === "Fail") return `Flag state: readiness dropped to ${readiness.toFixed(1)} with anomaly z-score ${anomalyZ.toFixed(2)}.`;
  if (status === "Review") return `Retest state: borderline readiness (${readiness.toFixed(1)}). AI drift monitor triggered at z ${anomalyZ.toFixed(2)}.`;
  return `Within expected baseline envelope (z ${anomalyZ.toFixed(2)}).`;
}

export function suggestedActionText(status: AssessmentStatus): string {
  if (status === "Fail") return "Do not start high-risk task. Route to supervisor, apply fatigue protocol, and retest in 30 minutes.";
  if (status === "Review") return "Assign low-risk duties, re-screen after first break, and confirm supervisor check-in.";
  return "Cleared to begin shift under standard controls.";
}
