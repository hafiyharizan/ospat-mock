import type { RiskLevel } from "./types";

export function deviationPct(score: number, baseline: number): number {
  if (baseline <= 0) return 0;
  return ((score - baseline) / baseline) * 100;
}

export function classify(
  score: number,
  baseline: number,
  recentScores: number[],
): RiskLevel {
  const dev = deviationPct(score, baseline);

  if (dev <= -15) return "Review Required";

  const consecutiveDeclines = countConsecutiveDeclines([...recentScores, score]);
  const belowBaseline = score < baseline;
  if (consecutiveDeclines >= 3 && belowBaseline) return "Review Required";

  if (dev <= -10) return "Monitor";

  return "Cleared";
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

export function reasonText(
  score: number,
  baseline: number,
  recentScores: number[],
): string {
  const dev = deviationPct(score, baseline);
  const declines = countConsecutiveDeclines([...recentScores, score]);
  if (dev <= -15) {
    return `Score ${Math.abs(dev).toFixed(0)}% below personal baseline.`;
  }
  if (declines >= 3 && score < baseline) {
    return `${declines} consecutive declining results below baseline.`;
  }
  if (dev <= -10) {
    return `Score ${Math.abs(dev).toFixed(0)}% below baseline (monitor).`;
  }
  return "Within normal range.";
}

export function suggestedActionText(level: RiskLevel): string {
  switch (level) {
    case "Review Required":
      return "Hold from shift. Supervisor 1:1, fatigue check, repeat assessment in 30m.";
    case "Monitor":
      return "Pair with experienced operator. Re-assess after first break.";
    case "Cleared":
      return "Proceed to shift.";
  }
}
