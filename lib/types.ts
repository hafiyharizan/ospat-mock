export type ShiftType = "Day" | "Night" | "FIFO";

export type RiskLevel = "Cleared" | "Monitor" | "Review Required";

export type ReviewStatus = "open" | "acknowledged" | "reviewed";

export interface Site {
  id: string;
  name: string;
  region: string;
  type: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  primarySiteId: string;
  primaryShift: ShiftType;
  baseline: number;
  joinedISO: string;
}

export interface Assessment {
  id: string;
  employeeId: string;
  siteId: string;
  shift: ShiftType;
  timestampISO: string;
  score: number;
  deviationPct: number;
  riskLevel: RiskLevel;
}

export interface DashboardKpis {
  totalToday: number;
  cleared: number;
  flagged: number;
  avgScore: number;
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
  avgScore: number;
  highestRiskShift: ShiftType;
  trend7d: number;
  recentScores: number[];
}

export interface EmployeeDetail {
  employee: Employee;
  site: Site;
  recent: Assessment[];
  baseline: number;
  latestScore: number;
  deviationPct: number;
  consecutiveDeclines: number;
  riskLevel: RiskLevel;
  insight: string;
}

export interface FlaggedCase {
  assessment: Assessment;
  employee: Employee;
  site: Site;
  reason: string;
  suggestedAction: string;
}
