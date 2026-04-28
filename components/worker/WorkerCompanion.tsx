"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Stage = "pre" | "test" | "result";

/* ─── Worker data ─────────────────────────────────────────── */
const WORKER = {
  name: "Marcus Tran",
  id: "#W-2841",
  site: "Pit 4 · Mt Whaleback",
  supervisor: "Reg Cooper",
  supervisorRole: "Shift Lead",
  supervisorDistance: "80 m away",
  score: 52,
  band: [68, 84] as [number, number],
  history: [76,78,80,75,79,82,77,73,70,68,71,66,64,62,58,60,55,53,54,52],
};

const TEST_FACTORS = [
  { label: "Reaction time", detail: "response speed" },
  { label: "Hand-eye coordination", detail: "cursor control" },
  { label: "Cognitive alertness", detail: "tracking consistency" },
];

const RESULT_FACTORS = [
  { label: "Reaction time", value: "342 ms", detail: "within personal range", tone: "ok" },
  { label: "Hand-eye coordination", value: "52", detail: "below usual band", tone: "err" },
  { label: "Cognitive alertness", value: "Watch", detail: "sustained drift detected", tone: "warn" },
];

function toneColor(tone: string) {
  if (tone === "err") return "var(--danger)";
  if (tone === "warn") return "var(--warning)";
  return "var(--success)";
}

/* ─── Pre-shift sparkline ─────────────────────────────────── */
function Sparkline() {
  const W = 260, H = 60, pad = 4;
  const data = WORKER.history;
  const [lo, hi] = WORKER.band;
  const min = Math.min(...data, lo) - 2;
  const max = Math.max(...data, hi) + 2;
  const sx = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const sy = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect x={pad} y={sy(hi)} width={W - pad * 2} height={Math.max(0, sy(lo) - sy(hi))}
        fill="var(--success)" opacity="0.12" />
      <path d={d} stroke="var(--fg)" strokeWidth="1.5" fill="none" />
      <circle cx={sx(data.length - 1)} cy={sy(data[data.length - 1])} r="4"
        fill="var(--danger)" stroke="var(--bg-elev)" strokeWidth="2" />
    </svg>
  );
}

/* ─── Score donut ─────────────────────────────────────────── */
function ScoreDonut({ score, band }: { score: number; band: [number, number] }) {
  const R = 36, C = 2 * Math.PI * R;
  const pct = score / 100;
  return (
    <svg width={88} height={88}>
      <circle cx={44} cy={44} r={R} stroke="color-mix(in oklch, var(--danger) 15%, transparent)"
        strokeWidth="4" fill="none" />
      <circle cx={44} cy={44} r={R} stroke="var(--danger)" strokeWidth="4" fill="none"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
        strokeLinecap="round" transform="rotate(-90 44 44)" />
      <text x={44} y={44} textAnchor="middle" dominantBaseline="central"
        fontFamily="var(--font-mono)" fontSize="22" fontWeight="600"
        fill="var(--danger)">{score}</text>
    </svg>
  );
}

/* ─── Pre-shift screen ────────────────────────────────────── */
function PreShiftScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-6 py-5" style={{ color: "var(--fg)" }}>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--fg-subtle)" }}>
        05:48 · {WORKER.site}
      </div>

      <h1 className="mt-4 text-[30px] font-semibold leading-tight"
        style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
        Morning, {WORKER.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        Log in at the terminal and complete a 30-60 second impairment screen before shift starts.
      </p>

      <div className="mt-4 grid gap-2">
        {TEST_FACTORS.map((factor) => (
          <div
            key={factor.label}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
          >
            <span className="text-[12.5px] font-medium" style={{ color: "var(--fg)" }}>
              {factor.label}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.04em]" style={{ color: "var(--fg-subtle)" }}>
              {factor.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Last 20 shifts card */}
      <div className="mt-5 rounded-xl p-4"
        style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Last 20 shifts</span>
          <span className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
            band {WORKER.band[0]}–{WORKER.band[1]}
          </span>
        </div>
        <Sparkline />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>Last result</span>
          <span className="font-mono text-[12px] font-semibold" style={{ color: "var(--danger)" }}>
            {WORKER.score} · below band
          </span>
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        Hold the device flat. Follow the dot. Your supervisor sees the result,{" "}
        <strong style={{ color: "var(--fg)" }}>not a diagnosis.</strong>
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          onClick={onStart}
          className="h-12 w-full rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98]"
          style={{
            background: "var(--accent)",
            color: "var(--white)",
            border: "none",
            boxShadow: "var(--shadow-button)",
            cursor: "pointer",
          }}
        >
          Start check-in
        </button>
        <div className="text-center font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
          {WORKER.id} · biometric verified
        </div>
      </div>
    </div>
  );
}

/* ─── Test screen ─────────────────────────────────────────── */
function TestScreen({ onComplete }: { onComplete: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  /* Live refs for SVG elements */
  const targetCircleRef  = useRef<SVGCircleElement>(null);
  const targetCenterRef  = useRef<SVGCircleElement>(null);
  const userCircleRef    = useRef<SVGCircleElement>(null);
  const trailRef         = useRef<SVGPathElement>(null);
  const connLineRef      = useRef<SVGLineElement>(null);
  const progressBarRef   = useRef<SVGRectElement>(null);
  const timerTextRef     = useRef<HTMLSpanElement>(null);
  const countdownRef     = useRef<HTMLSpanElement>(null);
  const rafRef           = useRef<number>(0);
  const elapsedRef       = useRef(0);
  const lastUiTickRef    = useRef(-1);
  const doneRef          = useRef(false);

  const W = 320, H = 380;
  const CX = W / 2, CY = H * 0.52, R = 112;
  const DURATION = 60;
  const BAR_W = W - 48;
  const progress = Math.min(1, elapsed / DURATION);
  const difficultyLevel = Math.min(9, Math.max(4, Math.round(5 + progress * 4)));
  const reactionMs = Math.round(308 + progress * 34);
  const coordinationScore = Math.round(76 - progress * 15);
  const alertness = progress > 0.54 ? "Watch" : "Stable";

  useEffect(() => {
    const start = performance.now();
    const positions: [number, number][] = [];

    const loop = (now: number) => {
      if (doneRef.current) return;
      const t = (now - start) / 1000;
      const e = Math.min(DURATION, t);
      elapsedRef.current = e;

      /* Target Lissajous */
      const tx = CX + Math.sin(t * 0.9) * R * 0.72;
      const ty = CY + Math.sin(t * 1.4) * R * 0.58;

      /* User follows with 350ms lag + noise */
      const lag = 0.35;
      const ux = CX + Math.sin((t - lag) * 0.9) * R * 0.72 + Math.sin(t * 3.8) * 4.5;
      const uy = CY + Math.sin((t - lag) * 1.4) * R * 0.58 + Math.cos(t * 3.8) * 4.5;

      /* Direct DOM updates — zero re-renders */
      if (targetCircleRef.current) {
        targetCircleRef.current.setAttribute("cx", tx.toFixed(2));
        targetCircleRef.current.setAttribute("cy", ty.toFixed(2));
      }
      if (targetCenterRef.current) {
        targetCenterRef.current.setAttribute("cx", tx.toFixed(2));
        targetCenterRef.current.setAttribute("cy", ty.toFixed(2));
      }
      if (userCircleRef.current) {
        userCircleRef.current.setAttribute("cx", ux.toFixed(2));
        userCircleRef.current.setAttribute("cy", uy.toFixed(2));
      }
      if (connLineRef.current) {
        connLineRef.current.setAttribute("x1", tx.toFixed(2));
        connLineRef.current.setAttribute("y1", ty.toFixed(2));
        connLineRef.current.setAttribute("x2", ux.toFixed(2));
        connLineRef.current.setAttribute("y2", uy.toFixed(2));
      }

      /* Trail */
      positions.push([ux, uy]);
      if (positions.length > 50) positions.shift();
      if (trailRef.current && positions.length > 1) {
        const pd = positions
          .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(" ");
        trailRef.current.setAttribute("d", pd);
      }

      /* Progress bar */
      if (progressBarRef.current) {
        progressBarRef.current.setAttribute("width", ((e / DURATION) * BAR_W).toFixed(1));
      }

      /* Timers — update HTML span elements directly */
      const mins = Math.floor(e / 60).toString().padStart(2, "0");
      const secs = Math.floor(e % 60).toString().padStart(2, "0");
      if (timerTextRef.current) timerTextRef.current.textContent = `${mins}:${secs}`;
      const left = Math.max(0, Math.ceil(DURATION - e));
      if (countdownRef.current) {
        countdownRef.current.textContent = `STAY ON TARGET · ${left}s LEFT`;
      }

      /* React state only at 5fps for small metric labels */
      const uiTick = Math.floor(e * 5);
      if (uiTick !== lastUiTickRef.current) {
        lastUiTickRef.current = uiTick;
        setElapsed(e);
      }

      if (e < DURATION) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        doneRef.current = true;
        setTimeout(onComplete, 600);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      doneRef.current = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "var(--fg-subtle)" }}>
          Adaptive tracking · level {difficultyLevel}
        </span>
        <span ref={timerTextRef} className="font-mono text-[13px]"
          style={{ color: "var(--fg-muted)" }}>
          00:00
        </span>
      </div>

      {/* Animation canvas */}
      <div className="flex-1 flex items-center justify-center">
        <svg
          ref={svgRef}
          width={W} height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", maxWidth: "100%" }}
        >
          {/* Grid circles */}
          {[R, R * 0.67, R * 0.33].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r}
              stroke="var(--border)" fill="none" />
          ))}

          {/* Target crosshair */}
          {[-8, 8].map((dx) => (
            <line key={dx} x1={CX + dx - 4} y1={CY} x2={CX + dx + 4} y2={CY}
              stroke="var(--border-strong)" strokeWidth="1" />
          ))}

          {/* Trail */}
          <path ref={trailRef} d="" stroke="var(--accent)"
            strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />

          {/* Connect line */}
          <line ref={connLineRef} x1={CX} y1={CY} x2={CX} y2={CY}
            stroke="var(--fg)" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 3" />

          {/* Target ring */}
          <circle ref={targetCircleRef} cx={CX} cy={CY} r={16}
            fill="none" stroke="var(--success)" strokeWidth="1.75" />
          {/* Target center */}
          <circle ref={targetCenterRef} cx={CX} cy={CY} r={3.5}
            fill="var(--success)" />

          {/* User dot glow */}
          <circle cx={CX} cy={CY} r={11}
            fill="var(--accent)" opacity="0.12" />
          {/* User dot */}
          <circle ref={userCircleRef} cx={CX} cy={CY} r={5}
            fill="var(--fg)" />
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 px-6 pb-4">
        {[
          ["REACTION", `${reactionMs}`, "ms", "ok"],
          ["COORDINATION", `${coordinationScore}`, "score", progress > 0.5 ? "warn" : "ok"],
          ["ALERTNESS", alertness, "", progress > 0.54 ? "warn" : "ok"],
        ].map(([label, val, unit, tone]) => (
          <div key={String(label)}>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: "var(--fg-subtle)" }}>
              {label}
            </div>
            <div className="mt-1 font-mono text-[24px] font-semibold leading-none"
              style={{
                color: tone === "warn" ? "var(--warning)" : "var(--fg)",
                letterSpacing: "-0.01em",
              }}>
              {val}
              {unit && (
                <span style={{ fontSize: 11, color: "var(--fg-subtle)", marginLeft: 2 }}>
                  {unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-6">
        <div className="mb-2 h-1 overflow-hidden rounded-full"
          style={{ background: "var(--border)" }}>
          <svg width="100%" height={4}>
            <rect ref={progressBarRef} x={0} y={0} width={0} height={4}
              fill="var(--accent)" rx={2} />
          </svg>
        </div>
        <div className="text-center">
          <span ref={countdownRef}
            className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: "var(--fg-subtle)" }}>
            STAY ON TARGET · 60s LEFT
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Result screen ───────────────────────────────────────── */
function ResultScreen({ onRetry }: { onRetry: () => void }) {
  const { score, band, supervisor, supervisorRole, supervisorDistance } = WORKER;
  const [band0, band1] = band;
  const belowBand = score < band0;

  return (
    <div className="flex flex-1 flex-col px-6 py-5" style={{ color: "var(--fg)" }}>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--fg-subtle)" }}>
        Result · 06:38
      </div>

      <h1 className="mt-4 text-[26px] font-semibold leading-tight"
        style={{ color: "var(--fg)", letterSpacing: "-0.018em" }}>
        {belowBand ? "Please see your\nsupervisor." : "You're good to go."}
      </h1>

      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {belowBand ? (
          <>
            Your check-in is below your personal range today. This isn&apos;t a
            judgement — it&apos;s a flag.{" "}
            <strong style={{ color: "var(--fg)" }}>{supervisor} has been notified.</strong>
          </>
        ) : (
          <>Your result is within your personal band. Have a safe shift.</>
        )}
      </p>

      {/* Score card */}
      <div
        className="mt-5 rounded-xl p-4"
        style={{
          background: belowBand
            ? "color-mix(in oklch, var(--danger) 8%, var(--bg))"
            : "color-mix(in oklch, var(--success) 8%, var(--bg))",
          border: `1px solid color-mix(in oklch, ${belowBand ? "var(--danger)" : "var(--success)"} 25%, transparent)`,
        }}
      >
        <div className="flex items-center gap-4">
          <ScoreDonut score={score} band={band} />
          <div>
            <span className={`badge ${belowBand ? "badge-err" : "badge-ok"}`}>
              {belowBand ? "BELOW BAND" : "IN BAND"}
            </span>
            <div className="mt-2 text-[16px] font-semibold" style={{ color: "var(--fg)" }}>
              Your usual is {band0}–{band1}.
            </div>
          </div>
        </div>
        <div
          className="mt-4 pt-3 text-[12px] leading-relaxed"
          style={{
            borderTop: `1px solid color-mix(in oklch, ${belowBand ? "var(--danger)" : "var(--success)"} 18%, transparent)`,
            color: "var(--fg-muted)",
          }}
        >
          Compared to{" "}
          <strong style={{ color: "var(--fg)" }}>your own history only</strong> — never
          to teammates or population averages.
        </div>
        <div className="mt-3 grid gap-2">
          {RESULT_FACTORS.map((factor) => (
            <div
              key={factor.label}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
              style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
            >
              <div>
                <div className="text-[12px] font-medium" style={{ color: "var(--fg)" }}>
                  {factor.label}
                </div>
                <div className="font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
                  {factor.detail}
                </div>
              </div>
              <span
                className="font-mono text-[13px] font-semibold"
                style={{ color: toneColor(factor.tone) }}
              >
                {factor.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Supervisor routing */}
      {belowBand && (
        <div
          className="mt-3 rounded-xl p-4"
          style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
        >
          <div className="eyebrow mb-3">Routed to</div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-semibold"
              style={{ background: "var(--neutral-700)", color: "var(--white)" }}
            >
              RC
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                {supervisor}
              </div>
              <div className="text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                {supervisorRole} · {supervisorDistance}
              </div>
            </div>
            <span className="badge badge-ok">
              <span className="h-1.5 w-1.5 rounded-full animate-ospat-pulse"
                style={{ background: "var(--success)" }} />
              notified
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2.5 pt-5">
        <button
          onClick={onRetry}
          className="flex-1 h-12 rounded-xl text-[14px] font-medium"
          style={{
            background: "var(--bg-elev)",
            color: "var(--fg)",
            border: "1px solid var(--border-strong)",
            cursor: "pointer",
          }}
        >
          {belowBand ? "Acknowledge alert" : "Done"}
        </button>
        <button
          className="h-12 rounded-xl px-5 text-[14px] font-medium"
          style={{
            background: belowBand ? "var(--accent)" : "var(--success)",
            color: "var(--white)",
            border: "none",
            boxShadow: "var(--shadow-button)",
            cursor: "pointer",
            flex: 1.4,
          }}
        >
          {belowBand ? "Open chat with Reg" : "View my history"}
        </button>
      </div>
    </div>
  );
}

/* ─── Root component ──────────────────────────────────────── */
export function WorkerCompanion() {
  const [stage, setStage] = useState<Stage>("pre");

  const handleStart    = useCallback(() => setStage("test"),   []);
  const handleComplete = useCallback(() => setStage("result"), []);
  const handleRetry    = useCallback(() => setStage("pre"),    []);

  return (
    /* Outer: centers a phone-like frame on desktop, full-screen on mobile */
    <div
      className="flex min-h-dvh items-start justify-center sm:items-center sm:p-6"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="relative flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden sm:max-h-[calc(100dvh-48px)] sm:min-h-[720px] sm:rounded-[24px]"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Back to role selector */}
        <div
          className="absolute left-4 top-4 z-20"
          style={{ display: stage === "test" ? "none" : "block" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-mono text-[11px]"
            style={{ color: "var(--fg-subtle)" }}
          >
            <ArrowLeft className="h-3 w-3" />
            roles
          </Link>
        </div>

        {/* Screens */}
        <div className="flex flex-1 flex-col pt-8">
          {stage === "pre"    && <PreShiftScreen  onStart={handleStart}       />}
          {stage === "test"   && <TestScreen      onComplete={handleComplete} />}
          {stage === "result" && <ResultScreen    onRetry={handleRetry}       />}
        </div>
      </div>
    </div>
  );
}
