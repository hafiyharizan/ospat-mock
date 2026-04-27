import { generateAll } from "./generate";
import { countConsecutiveDeclines, reasonText, suggestedActionText } from "./risk";
import type { Assessment, DashboardKpis, Employee, EmployeeDetail, FlaggedCase, ShiftType, Site, SiteSummary } from "./types";

const dataset = generateAll();
export const TODAY_ISO = dataset.today;

export function getSites(): Site[] { return dataset.sites; }
export function getEmployees(): Employee[] { return dataset.employees; }
export function getAssessments(): Assessment[] { return dataset.assessments; }
export function getEmployeeById(id: string) { return dataset.employees.find((e) => e.id === id); }
export function getSiteById(id: string) { return dataset.sites.find((s) => s.id === id); }

const sameDay = (aISO: string, bISO: string) => aISO.slice(0, 10) === bISO.slice(0, 10);
function withinLastNDays(iso: string, n: number, fromISO = TODAY_ISO): boolean {
  const t = new Date(iso).getTime();
  const from = new Date(fromISO).getTime();
  const ms = n * 24 * 60 * 60 * 1000;
  return from - t < ms && from - t >= 0;
}

export function getDashboardKpis(): DashboardKpis {
  const today = dataset.assessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO));
  const pass = today.filter((a) => a.status === "Pass").length;
  const review = today.filter((a) => a.status === "Review").length;
  const fail = today.filter((a) => a.status === "Fail").length;
  const avgReadiness = today.length ? today.reduce((s, a) => s + a.readinessScore, 0) / today.length : 0;

  const flaggedBySite = new Map<string, number>();
  for (const a of today) if (a.status !== "Pass") flaggedBySite.set(a.siteId, (flaggedBySite.get(a.siteId) ?? 0) + 1);
  const highRiskSites = [...flaggedBySite.entries()].map(([siteId, flagged]) => ({ siteId, siteName: getSiteById(siteId)?.name ?? siteId, flagged })).sort((a, b) => b.flagged - a.flagged).slice(0, 3);

  const last7 = dataset.assessments.filter((a) => withinLastNDays(a.timestampISO, 7));
  const prev7 = dataset.assessments.filter((a) => !withinLastNDays(a.timestampISO, 7) && withinLastNDays(a.timestampISO, 14));
  const avg7 = last7.length ? last7.reduce((s, a) => s + a.readinessScore, 0) / last7.length : 0;
  const avgPrev = prev7.length ? prev7.reduce((s, a) => s + a.readinessScore, 0) / prev7.length : 0;

  return {
    totalToday: today.length,
    pass,
    review,
    fail,
    avgReadiness: Number(avgReadiness.toFixed(1)),
    highRiskSites,
    trendVsPrevious7Days: Number((avgPrev === 0 ? 0 : ((avg7 - avgPrev) / avgPrev) * 100).toFixed(1)),
  };
}

export function getReadinessTrend(days = 14) {
  const out: { date: string; avg: number }[] = [];
  const today = new Date(TODAY_ISO);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString();
    const slice = dataset.assessments.filter((a) => sameDay(a.timestampISO, iso));
    out.push({ date: iso.slice(0, 10), avg: Number((slice.length ? slice.reduce((s, a) => s + a.readinessScore, 0) / slice.length : 0).toFixed(1)) });
  }
  return out;
}

export function getRiskDistribution() {
  const today = dataset.assessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO));
  const counts = { Pass: 0, Review: 0, Fail: 0 };
  for (const a of today) counts[a.status]++;
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getAssessmentsBySite() {
  const today = dataset.assessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO));
  const map = new Map<string, number>();
  for (const a of today) map.set(a.siteId, (map.get(a.siteId) ?? 0) + 1);
  return dataset.sites.map((s) => ({ siteId: s.id, siteName: s.name, count: map.get(s.id) ?? 0 }));
}

export function getFlaggedByShift() {
  const today = dataset.assessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO));
  const shifts: ShiftType[] = ["Day", "Night", "FIFO"];
  return shifts.map((shift) => {
    const slice = today.filter((a) => a.shift === shift);
    return { shift, Review: slice.filter((a) => a.status === "Review").length, Fail: slice.filter((a) => a.status === "Fail").length };
  });
}

export function getSiteSummaries(): SiteSummary[] {
  return dataset.sites.map((site) => {
    const siteAssessments = dataset.assessments.filter((a) => a.siteId === site.id);
    const today = siteAssessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO));
    const flagged = today.filter((a) => a.status !== "Pass").length;
    const avgReadiness = today.length ? today.reduce((s, a) => s + a.readinessScore, 0) / today.length : 0;

    const shifts: ShiftType[] = ["Day", "Night", "FIFO"];
    let highestRiskShift: ShiftType = "Day";
    let highestFlagged = -1;
    for (const sh of shifts) {
      const f = today.filter((a) => a.shift === sh && a.status !== "Pass").length;
      if (f > highestFlagged) { highestFlagged = f; highestRiskShift = sh; }
    }

    const last14 = siteAssessments.filter((a) => withinLastNDays(a.timestampISO, 14));
    const prev14 = siteAssessments.filter((a) => !withinLastNDays(a.timestampISO, 14) && withinLastNDays(a.timestampISO, 28));
    const a14 = last14.length ? last14.reduce((s, a) => s + a.readinessScore, 0) / last14.length : 0;
    const p14 = prev14.length ? prev14.reduce((s, a) => s + a.readinessScore, 0) / prev14.length : 0;

    const recentScores = getReadinessTrend(14).map((d) => {
      const slice = siteAssessments.filter((a) => a.timestampISO.startsWith(d.date));
      return slice.length ? Number((slice.reduce((s, a) => s + a.readinessScore, 0) / slice.length).toFixed(1)) : 0;
    });

    return { siteId: site.id, siteName: site.name, region: site.region, type: site.type, assessments: today.length, flagged, avgReadiness: Number(avgReadiness.toFixed(1)), highestRiskShift, trend14d: Number((p14 === 0 ? 0 : ((a14 - p14) / p14) * 100).toFixed(1)), recentScores };
  });
}

export function getEmployeeDetail(id: string): EmployeeDetail | null {
  const employee = getEmployeeById(id); if (!employee) return null;
  const site = getSiteById(employee.primarySiteId); if (!site) return null;
  const recent = dataset.assessments.filter((a) => a.employeeId === id).slice().sort((a, b) => (a.timestampISO < b.timestampISO ? -1 : 1));
  const latest = recent[recent.length - 1];
  const declines = countConsecutiveDeclines(recent.map((a) => a.readinessScore));
  const insight = latest.status === "Fail"
    ? `Flag state triggered by fatigue risk ${latest.metrics.fatigueRisk} and AI drift z-score ${latest.anomalyZ.toFixed(2)}.`
    : latest.status === "Review"
      ? `Retest state: readiness ${latest.readinessScore.toFixed(1)} with emerging deviation on reaction and focus.`
      : `Pass status with stable readiness trend. Baseline deviation ${latest.overallDeviationPct.toFixed(1)}%.`;

  return { employee, site, recent, latest, consecutiveDeclines: declines, insight };
}

export function getFlaggedCases(): FlaggedCase[] {
  const today = dataset.assessments.filter((a) => sameDay(a.timestampISO, TODAY_ISO) && a.status !== "Pass");
  return today.map((a) => {
    const employee = getEmployeeById(a.employeeId)!;
    const site = getSiteById(a.siteId)!;
    return { assessment: a, employee, site, reason: reasonText(a.status, a.readinessScore, a.anomalyZ), suggestedAction: suggestedActionText(a.status) };
  }).sort((a, b) => (a.assessment.status === "Fail" ? -1 : 1));
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
  readinessScore: number;
  reactionTimeMs: number;
  focusScore: number;
  fatigueRisk: number;
  coordinationScore: number;
  overallDeviationPct: number;
  anomalyZ: number;
  status: Assessment["status"];
}

export function getFeedRows(): FeedRow[] {
  return dataset.assessments.slice().sort((a, b) => (a.timestampISO < b.timestampISO ? 1 : -1)).slice(0, 250).map((a) => {
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
      readinessScore: a.readinessScore,
      reactionTimeMs: a.metrics.reactionTimeMs,
      focusScore: a.metrics.focusScore,
      fatigueRisk: a.metrics.fatigueRisk,
      coordinationScore: a.metrics.coordinationScore,
      overallDeviationPct: a.overallDeviationPct,
      anomalyZ: a.anomalyZ,
      status: a.status,
    };
  });
}
