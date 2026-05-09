"use client";

import { useState } from "react";
import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react";
import clsx from "clsx";
import { generateStaticSupervisorHandover, type AiHandoverResult } from "@/lib/aiHandover";

type Variant = "dashboard" | "review";

const initialCopy = {
  dashboard:
    "Summarise only Retest/Flag cases, cite the baseline metric that moved, and suggest the next supervisor action. No diagnosis.",
  review:
    "Turn the current Retest/Flag queue into a supervisor handover using only the already-calculated rule signals.",
};

function providerLabel(result: AiHandoverResult | null) {
  if (!result) return "Rule-based brief";
  if (result.source === "openrouter") return "OpenRouter live";
  return "Rule-based brief";
}

export function SupervisorHandoverCard({ variant = "dashboard" }: { variant?: Variant }) {
  const [result, setResult] = useState<AiHandoverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setIsLoading(true);
    setError(null);

    try {
      setResult(generateStaticSupervisorHandover());
    } catch {
      setError("Handover brief is unavailable from this browser session.");
    } finally {
      setIsLoading(false);
    }
  }

  const providerTone = result?.source === "fallback" ? "badge-warn" : "badge-info";
  const isReview = variant === "review";

  return (
    <div className="card" style={{ padding: isReview ? "14px 16px" : "12px 14px" }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="badge badge-info">AI assist</span>
        <span className={clsx("badge", providerTone)}>{providerLabel(result)}</span>
      </div>

      <h3 className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
        Supervisor handover brief
      </h3>

      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {result ? result.summary : initialCopy[variant]}
      </p>

      {result?.fallbackReason && (
        <div
          className="mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-[11.5px]"
          style={{
            background: "color-mix(in oklch, var(--warning) 8%, var(--bg-sunken))",
            border: "1px solid color-mix(in oklch, var(--warning) 28%, transparent)",
            color: "var(--fg-muted)",
          }}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--warning)" }} />
          <span>{result.fallbackReason}</span>
        </div>
      )}

      {error && (
        <div
          className="mt-3 rounded-md px-3 py-2 text-[11.5px]"
          style={{
            background: "color-mix(in oklch, var(--danger) 8%, var(--bg-sunken))",
            border: "1px solid color-mix(in oklch, var(--danger) 26%, transparent)",
            color: "var(--fg-muted)",
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={isLoading}
          className="btn-primary h-8 gap-1.5 text-[12px] disabled:cursor-wait disabled:opacity-70"
        >
          {isLoading ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {result ? "Refresh brief" : "Generate brief"}
        </button>
        <span className="font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
          {result ? `${result.caseCount} cases · ${result.model}` : "local rule engine"}
        </span>
      </div>
    </div>
  );
}
