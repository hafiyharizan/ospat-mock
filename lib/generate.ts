import { mulberry32, pickOne, randInt, gauss } from "./rng";
import { classify, deviationPct } from "./risk";
import type {
  Assessment,
  Employee,
  RiskLevel,
  ShiftType,
  Site,
} from "./types";

const SEED = 20260426;
const TODAY = new Date("2026-04-26T00:00:00Z");

const SITES: Site[] = [
  {
    id: "site-mine-a",
    name: "Mine Site A",
    region: "Pilbara, WA",
    type: "Open-cut mine",
  },
  {
    id: "site-transport-b",
    name: "Transport Depot B",
    region: "Hunter Valley, NSW",
    type: "Logistics depot",
  },
  {
    id: "site-construction-c",
    name: "Construction Zone C",
    region: "Brisbane, QLD",
    type: "Civil construction",
  },
  {
    id: "site-plant-d",
    name: "Industrial Plant D",
    region: "Gladstone, QLD",
    type: "Processing plant",
  },
];

const FIRST_NAMES = [
  "Jordan", "Riley", "Avery", "Casey", "Hayden", "Morgan", "Quinn", "Reese",
  "Sasha", "Devon", "Elliot", "Frankie", "Harper", "Indie", "Jules", "Kai",
  "Logan", "Marlowe", "Noor", "Oakley", "Parker", "Remy", "Sky", "Tatum",
  "Umi", "Vale", "Wren", "Xen", "Yael", "Zane", "Aria", "Bowen", "Cleo",
  "Dane", "Esme", "Finn", "Greta", "Huxley", "Iris", "Jin",
];

const LAST_NAMES = [
  "Walker", "Nguyen", "Patel", "Garcia", "Kowalski", "O'Brien", "Andersen",
  "Hassan", "Taylor", "Park", "Mendes", "Suzuki", "Holloway", "Whitlock",
  "Tremblay", "Diaz", "Singh", "Rojas", "Costa", "Larsen", "Iwata", "Bauer",
  "Mensah", "Petrov", "Carmichael", "Hayes", "Fernandez", "Aitken", "McKenzie",
  "Rahimi", "Olsen", "Vasquez", "Bukhari", "Becker", "Lindgren", "Quinones",
  "Doyle", "Sato", "Pham", "Marin",
];

const ROLES_BY_SITE: Record<string, string[]> = {
  "site-mine-a": [
    "Haul Truck Operator",
    "Drill Operator",
    "Shotfirer",
    "Pit Supervisor",
    "Maintenance Tech",
  ],
  "site-transport-b": [
    "Heavy Vehicle Driver",
    "Yard Marshal",
    "Logistics Coordinator",
    "Forklift Operator",
  ],
  "site-construction-c": [
    "Crane Operator",
    "Site Foreman",
    "Rigger",
    "Concreter",
    "Plant Operator",
  ],
  "site-plant-d": [
    "Process Operator",
    "Control Room Tech",
    "Boilermaker",
    "Mechanical Fitter",
    "Shift Supervisor",
  ],
};

const SHIFTS: ShiftType[] = ["Day", "Night", "FIFO"];

function buildEmployees(rnd: () => number): Employee[] {
  const employees: Employee[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 40; i++) {
    let name = "";
    while (true) {
      const fn = pickOne(rnd, FIRST_NAMES);
      const ln = pickOne(rnd, LAST_NAMES);
      const candidate = `${fn} ${ln}`;
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate);
        name = candidate;
        break;
      }
    }

    const site = pickOne(rnd, SITES);
    const role = pickOne(rnd, ROLES_BY_SITE[site.id]);
    const shift = pickOne(rnd, SHIFTS);
    const baseline = Math.round(70 + rnd() * 22); // 70..92
    const joined = new Date(TODAY);
    joined.setDate(joined.getDate() - randInt(rnd, 60, 1500));

    employees.push({
      id: `emp-${String(i + 1).padStart(3, "0")}`,
      name,
      role,
      primarySiteId: site.id,
      primaryShift: shift,
      baseline,
      joinedISO: joined.toISOString(),
    });
  }
  return employees;
}

function buildAssessments(
  rnd: () => number,
  employees: Employee[],
): Assessment[] {
  const out: Assessment[] = [];

  for (const emp of employees) {
    const fatigueProfile = rnd();
    const recentScores: number[] = [];

    for (let i = 19; i >= 0; i--) {
      const day = new Date(TODAY);
      day.setUTCDate(day.getUTCDate() - i);
      const hour =
        emp.primaryShift === "Day"
          ? 6 + randInt(rnd, 0, 1)
          : emp.primaryShift === "Night"
            ? 18 + randInt(rnd, 0, 1)
            : 5 + randInt(rnd, 0, 2);
      day.setUTCHours(hour, randInt(rnd, 0, 59), 0, 0);

      let stdev = 4;
      let center = emp.baseline;

      if (fatigueProfile > 0.85 && i <= 3) {
        center -= 8 + rnd() * 6;
        stdev = 5;
      } else if (fatigueProfile > 0.7 && i <= 1) {
        center -= 4 + rnd() * 4;
      } else if (fatigueProfile < 0.1 && i % 5 === 0) {
        center -= 12;
      }

      let score = Math.round(gauss(rnd, center, stdev));
      score = Math.max(40, Math.min(100, score));

      const dev = deviationPct(score, emp.baseline);
      const riskLevel: RiskLevel = classify(
        score,
        emp.baseline,
        recentScores.slice(-3),
      );

      const siteId = emp.primarySiteId;
      const shift = emp.primaryShift;

      out.push({
        id: `a-${emp.id}-${i}`,
        employeeId: emp.id,
        siteId,
        shift,
        timestampISO: day.toISOString(),
        score,
        deviationPct: Number(dev.toFixed(1)),
        riskLevel,
      });

      recentScores.push(score);
    }
  }

  out.sort((a, b) => (a.timestampISO < b.timestampISO ? 1 : -1));
  return out;
}

export function generateAll() {
  const rnd = mulberry32(SEED);
  const sites = SITES;
  const employees = buildEmployees(rnd);
  const assessments = buildAssessments(rnd, employees);
  return { sites, employees, assessments, today: TODAY.toISOString() };
}
