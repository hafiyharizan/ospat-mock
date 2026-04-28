import { mulberry32, pickOne, randInt, gauss } from "./rng";
import { classifyStatus, metricDeviations, readinessScore } from "./risk";
import type { Assessment, Employee, ShiftType, Site } from "./types";

const SEED = 20260426;
const TODAY = new Date("2026-04-26T00:00:00Z");

const SITES: Site[] = [
  { id: "site-mine-a", name: "Mine Site A", region: "Pilbara, WA", type: "Open-cut mine", latitude: -22.69, longitude: 117.79 },
  { id: "site-transport-b", name: "Transport Depot B", region: "Hunter Valley, NSW", type: "Logistics depot", latitude: -32.56, longitude: 151.17 },
  { id: "site-construction-c", name: "Construction Zone C", region: "Brisbane, QLD", type: "Civil construction", latitude: -27.47, longitude: 153.03 },
  { id: "site-plant-d", name: "Industrial Plant D", region: "Gladstone, QLD", type: "Processing plant", latitude: -23.85, longitude: 151.26 },
];

const FIRST_NAMES = ["Jordan","Riley","Avery","Casey","Hayden","Morgan","Quinn","Reese","Sasha","Devon","Elliot","Frankie","Harper","Indie","Jules","Kai","Logan","Marlowe","Noor","Oakley","Parker","Remy","Sky","Tatum","Umi","Vale","Wren","Xen","Yael","Zane","Aria","Bowen","Cleo","Dane","Esme","Finn","Greta","Huxley","Iris","Jin"];
const LAST_NAMES = ["Walker","Nguyen","Patel","Garcia","Kowalski","O'Brien","Andersen","Hassan","Taylor","Park","Mendes","Suzuki","Holloway","Whitlock","Tremblay","Diaz","Singh","Rojas","Costa","Larsen","Iwata","Bauer","Mensah","Petrov","Carmichael","Hayes","Fernandez","Aitken","McKenzie","Rahimi","Olsen","Vasquez","Bukhari","Becker","Lindgren","Quinones","Doyle","Sato","Pham","Marin"];

const ROLES_BY_SITE: Record<string, string[]> = {
  "site-mine-a": ["Haul Truck Operator", "Drill Operator", "Shotfirer", "Pit Supervisor", "Maintenance Tech"],
  "site-transport-b": ["Heavy Vehicle Driver", "Yard Marshal", "Logistics Coordinator", "Forklift Operator"],
  "site-construction-c": ["Crane Operator", "Site Foreman", "Rigger", "Concreter", "Plant Operator"],
  "site-plant-d": ["Process Operator", "Control Room Tech", "Boilermaker", "Mechanical Fitter", "Shift Supervisor"],
};
const SHIFTS: ShiftType[] = ["Day", "Night", "FIFO"];

function buildEmployees(rnd: () => number): Employee[] {
  const employees: Employee[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 60; i++) {
    let name = "";
    while (!name) {
      const candidate = `${pickOne(rnd, FIRST_NAMES)} ${pickOne(rnd, LAST_NAMES)}`;
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate);
        name = candidate;
      }
    }
    const site = pickOne(rnd, SITES);
    const joined = new Date(TODAY);
    joined.setDate(joined.getDate() - randInt(rnd, 90, 1600));
    employees.push({
      id: `emp-${String(i + 1).padStart(3, "0")}`,
      name,
      role: pickOne(rnd, ROLES_BY_SITE[site.id]),
      primarySiteId: site.id,
      primaryShift: pickOne(rnd, SHIFTS),
      baseline: {
        reactionTimeMs: randInt(rnd, 250, 360),
        focusScore: randInt(rnd, 72, 93),
        fatigueRisk: randInt(rnd, 14, 34),
        coordinationScore: randInt(rnd, 70, 92),
      },
      joinedISO: joined.toISOString(),
    });
  }
  return employees;
}

function zScore(val: number, mean: number, std: number): number {
  if (std <= 0.01) return 0;
  return (val - mean) / std;
}

function buildAssessments(rnd: () => number, employees: Employee[]): Assessment[] {
  const out: Assessment[] = [];

  for (const emp of employees) {
    const history: number[] = [];
    const fatigueProfile = rnd();

    for (let i = 19; i >= 0; i--) {
      const day = new Date(TODAY);
      day.setUTCDate(day.getUTCDate() - i);
      day.setUTCHours(emp.primaryShift === "Night" ? 18 : 6, randInt(rnd, 0, 59), 0, 0);

      const lateRun = i <= 2 && fatigueProfile > 0.72;
      const stressLoad = fatigueProfile > 0.88 && i <= 4;

      const metrics = {
        reactionTimeMs: Math.round(gauss(rnd, emp.baseline.reactionTimeMs + (lateRun ? 38 : 0), stressLoad ? 28 : 16)),
        focusScore: Math.round(gauss(rnd, emp.baseline.focusScore - (lateRun ? 10 : 0), stressLoad ? 9 : 5)),
        fatigueRisk: Math.round(gauss(rnd, emp.baseline.fatigueRisk + (lateRun ? 24 : 0), stressLoad ? 11 : 6)),
        coordinationScore: Math.round(gauss(rnd, emp.baseline.coordinationScore - (lateRun ? 11 : 0), stressLoad ? 9 : 5)),
      };

      metrics.reactionTimeMs = Math.max(180, Math.min(620, metrics.reactionTimeMs));
      metrics.focusScore = Math.max(35, Math.min(100, metrics.focusScore));
      metrics.fatigueRisk = Math.max(1, Math.min(100, metrics.fatigueRisk));
      metrics.coordinationScore = Math.max(40, Math.min(100, metrics.coordinationScore));

      const readiness = readinessScore(metrics);
      const rolling = history.slice(-12);
      const mean = rolling.length ? rolling.reduce((s, x) => s + x, 0) / rolling.length : readiness;
      const std = rolling.length > 2 ? Math.sqrt(rolling.reduce((s, x) => s + (x - mean) ** 2, 0) / rolling.length) : 6;
      const anomalyZ = Number(zScore(readiness, mean, std).toFixed(2));
      const status = classifyStatus(readiness, metrics.fatigueRisk, anomalyZ, readinessScore(emp.baseline));

      out.push({
        id: `a-${emp.id}-${i}`,
        employeeId: emp.id,
        siteId: emp.primarySiteId,
        shift: emp.primaryShift,
        timestampISO: day.toISOString(),
        metrics,
        readinessScore: readiness,
        overallDeviationPct: Number((((readiness - mean) / Math.max(mean, 1)) * 100).toFixed(1)),
        status,
        deviations: metricDeviations(metrics, emp.baseline),
        anomalyZ,
        aiRiskBand: anomalyZ <= -2.2 ? "Escalate" : anomalyZ <= -1.4 ? "Watch" : "Stable",
      });

      history.push(readiness);
    }
  }

  out.sort((a, b) => (a.timestampISO < b.timestampISO ? 1 : -1));
  return out;
}

export function generateAll() {
  const rnd = mulberry32(SEED);
  const employees = buildEmployees(rnd);
  const assessments = buildAssessments(rnd, employees);
  return { sites: SITES, employees, assessments, today: TODAY.toISOString() };
}
