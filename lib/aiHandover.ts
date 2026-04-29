import { getFlaggedCases } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import type { AssessmentStatus } from "@/lib/types";

export type AiHandoverSource = "openrouter" | "fallback";

export interface AiHandoverCase {
  assessmentId: string;
  employeeName: string;
  employeeId: string;
  role: string;
  siteName: string;
  shift: string;
  timestamp: string;
  status: AssessmentStatus;
  readinessScore: number;
  deviationPct: number;
  movedMetrics: string[];
  suggestedAction: string;
}

export interface AiHandoverResult {
  source: AiHandoverSource;
  model: string;
  summary: string;
  caseCount: number;
  generatedAt: string;
  fallbackReason?: string;
}

const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildCases(): AiHandoverCase[] {
  return getFlaggedCases()
    .slice(0, 8)
    .map((item) => ({
      assessmentId: item.assessment.id,
      employeeName: item.employee.name,
      employeeId: item.employee.id,
      role: item.employee.role,
      siteName: item.site.name,
      shift: item.assessment.shift,
      timestamp: formatDateTime(item.assessment.timestampISO),
      status: item.assessment.status,
      readinessScore: item.assessment.readinessScore,
      deviationPct: item.assessment.overallDeviationPct,
      movedMetrics: item.metricReasons.length
        ? item.metricReasons
        : ["Readiness below personal baseline"],
      suggestedAction: item.suggestedAction,
    }));
}

function fallbackSummary(cases: AiHandoverCase[]): string {
  if (!cases.length) {
    return "No Retest or Flag cases are open. Keep standard shift-start monitoring active and review the next assessment wave before handover.";
  }

  const failCases = cases.filter((item) => item.status === "Fail");
  const reviewCases = cases.filter((item) => item.status === "Review");
  const priority = failCases[0] ?? reviewCases[0] ?? cases[0];
  const second = cases.find((item) => item.assessmentId !== priority.assessmentId);
  const priorityMetric = priority.movedMetrics[0] ?? "Readiness below personal baseline";

  const lines = [
    `${failCases.length} Flag and ${reviewCases.length} Retest cases need supervisor review before high-risk work starts.`,
    `${priority.employeeName} is the first handover priority at ${priority.siteName}: ${priorityMetric}.`,
  ];

  if (second) {
    lines.push(`${second.employeeName} should be checked next; ${second.movedMetrics[0] ?? "baseline movement"} is the cited signal.`);
  }

  lines.push(`Next action: ${priority.suggestedAction}`);
  return lines.join(" ");
}

function coerceSummary(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractOpenRouterText(payload: unknown): string {
  const data = payload as {
    choices?: Array<{ message?: { content?: unknown }; text?: unknown }>;
  };
  const choice = data.choices?.[0];
  return coerceSummary(choice?.message?.content ?? choice?.text);
}

function buildPrompt(cases: AiHandoverCase[]): string {
  return [
    "Create a supervisor handover brief from these already-classified OSPAT+ Retest/Flag cases.",
    "Rules:",
    "- Use only the supplied cases and moved metrics.",
    "- Do not diagnose medical conditions or impairment.",
    "- Prioritise Flag before Retest.",
    "- Cite the baseline metric that moved.",
    "- Keep it under 120 words.",
    "- Return plain text with 3 short bullets and one final next-action sentence.",
    "",
    JSON.stringify(cases, null, 2),
  ].join("\n");
}

export async function generateSupervisorHandover(): Promise<AiHandoverResult> {
  const cases = buildCases();
  const generatedAt = new Date().toISOString();
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return {
      source: "fallback",
      model: "deterministic-rule-fallback",
      summary: fallbackSummary(cases),
      caseCount: cases.length,
      generatedAt,
      fallbackReason: "OPENROUTER_API_KEY is not set",
    };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "OSPAT+ Operations Concept",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a concise operations safety assistant. Summarise workflow risk signals without diagnosis.",
          },
          { role: "user", content: buildPrompt(cases) },
        ],
        temperature: 0.2,
        max_tokens: 220,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        source: "fallback",
        model: "deterministic-rule-fallback",
        summary: fallbackSummary(cases),
        caseCount: cases.length,
        generatedAt,
        fallbackReason: `OpenRouter returned ${response.status}`,
      };
    }

    const payload = (await response.json()) as unknown;
    const summary = extractOpenRouterText(payload);

    if (!summary) {
      return {
        source: "fallback",
        model: "deterministic-rule-fallback",
        summary: fallbackSummary(cases),
        caseCount: cases.length,
        generatedAt,
        fallbackReason: "OpenRouter response did not include text",
      };
    }

    return {
      source: "openrouter",
      model,
      summary,
      caseCount: cases.length,
      generatedAt,
    };
  } catch {
    return {
      source: "fallback",
      model: "deterministic-rule-fallback",
      summary: fallbackSummary(cases),
      caseCount: cases.length,
      generatedAt,
      fallbackReason: "OpenRouter request failed",
    };
  }
}
