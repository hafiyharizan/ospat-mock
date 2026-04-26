import { generateAll } from "./generate";
import { countConsecutiveDeclines, deviationPct, reasonText, suggestedActionText } from "./risk";
import type {
  Assessment,
  DashboardKpis,
  Employee,
  EmployeeDetail,
  FlaggedCase,
  ShiftType,
  Site,
  SiteSummary,
} from "./types";

const dataset = generateAll();

export const TODAY_ISO = dataset.today;

export function getSites(): Site[] {
  return dataset.sites;
}

export function getEmployees(): Employee[] {
  return dataset.employees;
}

export function getAssessments(): Assessment[] {
  return dataset.assessments;
}

export function getEmployeeById(id: string): Employee | undefined {
  return dataset.employees.find((e) => e.id === id);
}

export function getSiteById(id: string): Site | undefined {
  return dataset.sites.find((s) => s.id === id);
}

function isSameUTCDay(aISO: string, bISO: string): boolean {
  return aISO.slice(0, 10) === bISO.slice(0, 10);
}

function withinLastNDays(iso: string, n: number, fromISO = TODAY_ISO): boolean {
  const t = new Date(iso).getTime();
  const from = new Date(fromISO).getTime();
  const ms = n * 24 * 60 * 60 * 1000;
  return from - t < ms && from - t >= 0;
}

export function getDashboardKpis(): DashboardKpis {
  const today = dataset.assessments.filter((a) =>
    isSameUTCDay(a.timestampISO, TODAY_ISO),
  );
  const cleared = today.filter((a) => a.riskLevel === "Cleared").length;
  const flagged = today.filter((a) => a.riskLevel !== "Cleared").length;
  const avgScore =
    today.length === 0
      ? 0
      : today.reduce((s, a) => s + a.score, 0) / today.length;

  const flaggedBySite = new Map<string, number>();
  for (const a of today) {
    if (a.riskLevel !== "Cleared") {
      flaggedBySite.set(a.siteId, (flaggedBySite.get(a.siteId) ?? 0) + 1);
    }
  }
  const highRiskSites = [...flaggedBySite.entries()]
    .map(([siteId, flagged]) => ({
      siteId,
      siteName: getSiteById(siteId)?.name ?? siteId,
      flagged,
    }))
    .sort((a, b) => b.flagged - a.flagged)
    .slice(0, 3);

  const last7 = dataset.assessments.filter((a) => withinLastNDays(a.timestampISO, 7));
  const prev7 = dataset.assessments.filter(
    (a) =>
      !withinLastNDays(a.timestampISO, 7) &&
      withinLastNDays(a.timestampISO, 14),
  );
  const avg7 = last7.length ? last7.reduce((s, a) => s + a.score, 0) / last7.length : 0;
  const avgPrev = prev7.length ? prev7.reduce((s, a) => s + a.score, 0) / prev7.length : 0;
  const trendVsPrevious7Days = avgPrev === 0 ? 0 : ((avg7 - avgPrev) / avgPrev) * 100;

  return {
    totalToday: today.length,
    cleared,
    flagged,
    avgScore: Number(avgScore.toFixed(1)),
    highRiskSites,
    trendVsPrevious7Days: Number(trendVsPrevious7Days.toFixed(1)),
  };
}

export function getReadinessTrend(days = 14): { date: string; avg: number }[] {
  const out: { date: string; avg: number }[] = [];
  const today = new Date(TODAY_ISO);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString();
    const slice = dataset.assessments.filter((a) =>
      isSameUTCDay(a.timestampISO, iso),
    );
    const avg = slice.length
      ? slice.reduce((s, a) => s + a.score, 0) / slice.length
      : 0;
    out.push({
      date: iso.slice(0, 10),
      avg: Number(avg.toFixed(1)),
    });
  }
  return out;
}

export function getRiskDistribution(): { name: string; value: number }[] {
  const today = dataset.assessments.filter((a) =>
    isSameUTCDay(a.timestampISO, TODAY_ISO),
  );
  const counts = { Cleared: 0, Monitor: 0, "Review Required": 0 } as Record<
    string,
    number
  >;
  for (const a of today) counts[a.riskLevel]++;
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getAssessmentsBySite(): {
  siteId: string;
  siteName: string;
  count: number;
}[] {
  const today = dataset.assessments.filter((a) =>
    isSameUTCDay(a.timestampISO, TODAY_ISO),
  );
  const map = new Map<string, number>();
  for (const a of today) map.set(a.siteId, (map.get(a.siteId) ?? 0) + 1);
  return dataset.sites.map((s) => ({
    siteId: s.id,
    siteName: s.name,
    count: map.get(s.id) ?? 0,
  }));
}

export function getFlaggedByShift(): {
  shift: ShiftType;
  Monitor: number;
  Review: number;
}[] {
  const today = dataset.assessments.filter((a) =>
    isSameUTCDay(a.timestampISO, TODAY_ISO),
  );
  const shifts: ShiftType[] = ["Day", "Night", "FIFO"];
  return shifts.map((shift) => {
    const slice = today.filter((a) => a.shift === shift);
    return {
      shift,
      Monitor: slice.filter((a) => a.riskLevel === "Monitor").length,
      Review: slice.filter((a) => a.riskLevel === "Review Required").length,
    };
  });
}

export function getSiteSummaries(): SiteSummary[] {
  return dataset.sites.map((site) => {
    const siteAssessments = dataset.assessments.filter((a) => a.siteId === site.id);
    const today = siteAssessments.filter((a) =>
      isSameUTCDay(a.timestampISO, TODAY_ISO),
    );
    const flagged = today.filter((a) => a.riskLevel !== "Cleared").length;
    const avgScore =
      today.length === 0
        ? 0
        : today.reduce((s, a) => s + a.score, 0) / today.length;

    const shifts: ShiftType[] = ["Day", "Night", "FIFO"];
    let highestRiskShift: ShiftType = "Day";
    let highestFlagged = -1;
    for (const sh of shifts) {
      const f = today.filter((a) => a.shift === sh && a.riskLevel !== "Cleared").length;
      if (f > highestFlagged) {
        highestFlagged = f;
        highestRiskShift = sh;
      }
    }

    const last7 = siteAssessments.filter((a) => withinLastNDays(a.timestampISO, 7));
    const prev7 = siteAssessments.filter(
      (a) =>
        !withinLastNDays(a.timestampISO, 7) &&
        withinLastNDays(a.timestampISO, 14),
    );
    const a7 = last7.length ? last7.reduce((s, a) => s + a.score, 0) / last7.length : 0;
    const ap = prev7.length ? prev7.reduce((s, a) => s + a.score, 0) / prev7.length : 0;
    const trend = ap === 0 ? 0 : ((a7 - ap) / ap) * 100;

    const recentScores = getReadinessTrend(7).map((d) => {
      const slice = siteAssessments.filter((a) =>
        a.timestampISO.startsWith(d.date),
      );
      return slice.length
        ? Number((slice.reduce((s, a) => s + a.score, 0) / slice.length).toFixed(1))
        : 0;
    });

    return {
      siteId: site.id,
      siteName: site.name,
      region: site.region,
      type: site.type,
      assessments: today.length,
      flagged,
      avgScore: Number(avgScore.toFixed(1)),
      highestRiskShift,
      trend7d: Number(trend.toFixed(1)),
      recentScores,
    };
  });
}

export function getEmployeeDetail(id: string): EmployeeDetail | null {
  const employee = getEmployeeById(id);
  if (!employee) return null;
  const site = getSiteById(employee.primarySiteId);
  if (!site) return null;

  const recent = dataset.assessments
    .filter((a) => a.employeeId === id)
    .slice()
    .sort((a, b) => (a.timestampISO < b.timestampISO ? -1 : 1));

  const latestScore = recent.length ? recent[recent.length - 1].score : employee.baseline;
  const dev = deviationPct(latestScore, employee.baseline);
  const declines = countConsecutiveDeclines(recent.map((a) => a.score));
  const latestRisk = recent.length ? recent[recent.length - 1].riskLevel : "Cleared";

  let insight = "";
  if (latestRisk === "Review Required") {
    insight =
      `This employee's latest score is ${Math.abs(dev).toFixed(0)}% ${dev < 0 ? "below" : "above"} their personal baseline` +
      (declines >= 2
        ? ` and follows ${declines} consecutive declining results. Supervisor review recommended.`
        : `. Supervisor review recommended.`);
  } else if (latestRisk === "Monitor") {
    insight = `This employee's latest score is ${Math.abs(dev).toFixed(0)}% below their personal baseline. Continue monitoring across the next assessments.`;
  } else if (declines >= 2) {
    insight = `Latest result is within range, but the trend shows ${declines} consecutive declining scores. Worth a check-in.`;
  } else {
    insight = `Latest result is within ${Math.abs(dev).toFixed(0)}% of personal baseline. Performance is stable.`;
  }

  return {
    employee,
    site,
    recent,
    baseline: employee.baseline,
    latestScore,
    deviationPct: Number(dev.toFixed(1)),
    consecutiveDeclines: declines,
    riskLevel: latestRisk,
    insight,
  };
}

export function getFlaggedCases(): FlaggedCase[] {
  const today = dataset.assessments.filter((a) =>
    isSameUTCDay(a.timestampISO, TODAY_ISO),
  );
  const flagged = today.filter((a) => a.riskLevel !== "Cleared");
  return flagged
    .map((a) => {
      const employee = getEmployeeById(a.employeeId);
      const site = getSiteById(a.siteId);
      if (!employee || !site) return null;
      const history = dataset.assessments
        .filter((x) => x.employeeId === a.employeeId && x.id !== a.id)
        .map((x) => x.score);
      return {
        assessment: a,
        employee,
        site,
        reason: reasonText(a.score, employee.baseline, history.slice(-3)),
        suggestedAction: suggestedActionText(a.riskLevel),
      };
    })
    .filter((x): x is FlaggedCase => x !== null)
    .sort((a, b) => {
      const order = { "Review Required": 0, Monitor: 1, Cleared: 2 } as Record<string, number>;
      return order[a.assessment.riskLevel] - order[b.assessment.riskLevel];
    });
}

export interface FeedRow {
  assessmentId: string;
  employeeId: string;
  employeeName: string;
  siteId: string;
  siteName: string;
  role: string;
  shift: ShiftType;
  timestampISO: string;
  score: number;
  baseline: number;
  deviationPct: number;
  riskLevel: Assessment["riskLevel"];
}

export function getFeedRows(): FeedRow[] {
  return dataset.assessments
    .slice()
    .sort((a, b) => (a.timestampISO < b.timestampISO ? 1 : -1))
    .slice(0, 200)
    .map((a) => {
      const emp = getEmployeeById(a.employeeId)!;
      const site = getSiteById(a.siteId)!;
      return {
        assessmentId: a.id,
        employeeId: emp.id,
        employeeName: emp.name,
        siteId: site.id,
        siteName: site.name,
        role: emp.role,
        shift: a.shift,
        timestampISO: a.timestampISO,
        score: a.score,
        baseline: emp.baseline,
        deviationPct: a.deviationPct,
        riskLevel: a.riskLevel,
      };
    });
}
