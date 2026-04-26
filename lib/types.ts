export type ShiftType = "Day" | "Night" | "FIFO";

export type AssessmentStatus = "Pass" | "Review" | "Fail";

export type ReviewStatus = "open" | "acknowledged" | "reviewed";

export interface Site {
  id: string;
  name: string;
  region: string;
  type: string;
}

export interface BaselineMetrics {
  reactionTimeMs: number;
  focusScore: number;
  fatigueRisk: number;
  coordinationScore: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  primarySiteId: string;
  primaryShift: ShiftType;
  baseline: BaselineMetrics;
  joinedISO: string;
}

export interface MetricSet extends BaselineMetrics {}

export interface Assessment {
  id: string;
  employeeId: string;
  siteId: string;
  shift: ShiftType;
  timestampISO: string;
  metrics: MetricSet;
  readinessScore: number;
  overallDeviationPct: number;
  status: AssessmentStatus;
  deviations: MetricSet;
  anomalyZ: number;
  aiRiskBand: "Stable" | "Watch" | "Escalate";
}

export interface DashboardKpis {
  totalToday: number;
  pass: number;
  review: number;
  fail: number;
  avgReadiness: number;
  highRiskSites: { siteId: string; siteName: string; flagged: number }[];
  trendVsPrevious7Days: number;
}

export interface SiteSummary {
  siteId: string;
  siteName: string;
  region: string;
  type: string;
  assessments: number;
  flagged: number;
  avgReadiness: number;
  highestRiskShift: ShiftType;
  trend14d: number;
  recentScores: number[];
}

export interface EmployeeDetail {
  employee: Employee;
  site: Site;
  recent: Assessment[];
  latest: Assessment;
  consecutiveDeclines: number;
  insight: string;
}

export interface FlaggedCase {
  assessment: Assessment;
  employee: Employee;
  site: Site;
  reason: string;
  suggestedAction: string;
}
