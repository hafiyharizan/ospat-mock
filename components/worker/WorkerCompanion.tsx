"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";

type Stage = "pre" | "test" | "result";
type ControlMode = "touch" | "tilt";
type Decision = "FIT" | "CAUTION" | "AT RISK";

type TestResult = {
  durationSec: number;
  reactionAvgMs: number;
  coordinationScore: number;
  alertnessScore: number;
  missedEvents: number;
  falseTaps: number;
  modeUsed: ControlMode;
  decision: Decision;
  reasons: string[];
  deviation: { reactionPct: number; coordinationPct: number; alertnessPct: number } | null;
};

type StoredResult = Pick<TestResult, "reactionAvgMs" | "coordinationScore" | "alertnessScore">;

const STORAGE_KEY = "ospat_worker_results_v1";
const TEST_DURATION = 60;

const WORKER = { name: "Marcus Tran", id: "#W-2841", site: "Pit 4 · Mt Whaleback" };

const TEST_FACTORS = [
  { label: "Reaction time", detail: "tap response speed" },
  { label: "Hand-eye coordination", detail: "tracking stability" },
  { label: "Cognitive alertness", detail: "consistency under load" },
];

function toneColor(tone: "err" | "warn" | "ok") {
  if (tone === "err") return "var(--danger)";
  if (tone === "warn") return "var(--warning)";
  return "var(--success)";
}

function pctDelta(current: number, baseline: number, lowerIsBetter = false) {
  if (!baseline) return 0;
  const raw = ((current - baseline) / baseline) * 100;
  return lowerIsBetter ? raw : -raw;
}

function getStoredResults(): StoredResult[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function PreShiftScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-6 py-5" style={{ color: "var(--fg)" }}>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>05:48 · {WORKER.site}</div>
      <h1 className="mt-4 text-[30px] font-semibold leading-tight" style={{ letterSpacing: "-0.02em" }}>Morning, {WORKER.name.split(" ")[0]}.</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>Complete a 60-second fitness-for-work prototype check before shift starts.</p>
      <div className="mt-4 grid gap-2">{TEST_FACTORS.map((factor) => <div key={factor.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}><span className="text-[12.5px] font-medium">{factor.label}</span><span className="font-mono text-[10.5px] uppercase tracking-[0.04em]" style={{ color: "var(--fg-subtle)" }}>{factor.detail}</span></div>)}</div>
      <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>Follow the moving target and react to brief flash prompts. This is a readiness signal, not a diagnosis.</p>
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button onClick={onStart} className="h-12 w-full rounded-xl text-[15px] font-semibold active:scale-[0.98]" style={{ background: "var(--accent)", color: "var(--white)", border: "none", boxShadow: "var(--shadow-button)", cursor: "pointer" }}>Start check-in</button>
        <div className="text-center font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>{WORKER.id} · biometric verified</div>
      </div>
    </div>
  );
}

function TestScreen({ onComplete }: { onComplete: (result: TestResult) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<ControlMode>("touch");
  const [tiltAvailable, setTiltAvailable] = useState(false);
  const [tiltGranted, setTiltGranted] = useState(false);
  const [reactionAvg, setReactionAvg] = useState(0);
  const [missedEvents, setMissedEvents] = useState(0);
  const [falseTaps, setFalseTaps] = useState(0);
  const [coordinationScore, setCoordinationScore] = useState(100);

  const W = 320, H = 380, CX = W / 2, CY = H * 0.52;
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);
  const userRef = useRef({ x: CX, y: CY, vx: 0, vy: 0 });
  const targetRef = useRef({ x: CX, y: CY });
  const touchActive = useRef(false);
  const tiltRef = useRef({ beta: 0, gamma: 0 });

  const reactionTimes = useRef<number[]>([]);
  const reactionEvent = useRef<{ active: boolean; appearedAt: number; expiresAt: number; x: number; y: number; hit: boolean }>({ active: false, appearedAt: 0, expiresAt: 0, x: CX, y: CY, hit: false });
  const nextReactionAt = useRef(0);
  const insideTime = useRef(0);
  const distAcc = useRef(0);
  const samples = useRef(0);
  const instabilityAcc = useRef(0);
  const smoothedCoord = useRef(85);

  useEffect(() => {
    const has = typeof window !== "undefined" && "DeviceOrientationEvent" in window;
    setTiltAvailable(has);
  }, []);

  const requestTiltPermission = useCallback(async () => {
    try {
      const request = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
      if (request) {
        const res = await request();
        setTiltGranted(res === "granted");
        if (res === "granted") setMode("tilt");
      } else {
        setTiltGranted(true);
        setMode("tilt");
      }
    } catch {
      setTiltGranted(false);
    }
  }, []);

  useEffect(() => {
    const onOrientation = (ev: DeviceOrientationEvent) => {
      tiltRef.current.beta = ev.beta ?? 0;
      tiltRef.current.gamma = ev.gamma ?? 0;
    };
    if (tiltAvailable && (tiltGranted || !(DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission)) {
      window.addEventListener("deviceorientation", onOrientation);
      return () => window.removeEventListener("deviceorientation", onOrientation);
    }
  }, [tiltAvailable, tiltGranted]);

  const handlePointer = (ev: React.PointerEvent<SVGSVGElement>) => {
    if (mode !== "touch") return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    touchActive.current = true;
    userRef.current.x = ((ev.clientX - rect.left) / rect.width) * W;
    userRef.current.y = ((ev.clientY - rect.top) / rect.height) * H;
  };

  const tapReaction = useCallback(() => {
    const evt = reactionEvent.current;
    if (!evt.active) {
      setFalseTaps((v) => v + 1);
      return;
    }
    evt.active = false;
    evt.hit = true;
    const rt = performance.now() - evt.appearedAt;
    reactionTimes.current.push(rt);
    const avg = reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length;
    setReactionAvg(Math.round(avg));
  }, []);

  useEffect(() => {
    const start = performance.now();
    nextReactionAt.current = 1200 + Math.random() * 1800;

    const loop = (now: number) => {
      if (doneRef.current) return;
      const t = (now - start) / 1000;
      const e = Math.min(TEST_DURATION, t);
      setElapsed(e);
      const progress = e / TEST_DURATION;
      const speed = 0.55 + progress * 0.85;
      const jitter = 0.12 + progress * 0.2;
      targetRef.current.x = CX + Math.sin(t * (1.05 + speed)) * (96 + progress * 22) + Math.sin(t * 4.9) * (3 + progress * 5);
      targetRef.current.y = CY + Math.sin(t * (1.42 + speed * 0.72)) * (76 + progress * 18) + Math.cos(t * 4.2) * (3 + progress * 5);

      if (mode === "tilt" && (tiltGranted || !(DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission)) {
        const tx = CX + Math.max(-35, Math.min(35, tiltRef.current.gamma)) * 2.8;
        const ty = CY + Math.max(-35, Math.min(35, tiltRef.current.beta)) * 2.1;
        userRef.current.vx += (tx - userRef.current.x) * 0.08;
        userRef.current.vy += (ty - userRef.current.y) * 0.08;
      }
      userRef.current.vx *= 0.84 - jitter * 0.1;
      userRef.current.vy *= 0.84 - jitter * 0.1;
      userRef.current.x += userRef.current.vx;
      userRef.current.y += userRef.current.vy;

      const dx = userRef.current.x - targetRef.current.x;
      const dy = userRef.current.y - targetRef.current.y;
      const dist = Math.hypot(dx, dy);
      distAcc.current += dist;
      samples.current += 1;
      if (dist < 20) insideTime.current += 1 / 60;
      instabilityAcc.current += Math.abs(userRef.current.vx) + Math.abs(userRef.current.vy);
      const avgDist = distAcc.current / samples.current;
      const insidePct = Math.min(1, insideTime.current / Math.max(1, e));
      const instability = instabilityAcc.current / samples.current;
      const rawCoord = Math.max(0, Math.min(100, 100 - avgDist * 0.95 + insidePct * 28 - instability * 1.7));
      smoothedCoord.current = smoothedCoord.current * 0.9 + rawCoord * 0.1;
      setCoordinationScore(Math.round(smoothedCoord.current));

      if (e >= nextReactionAt.current && !reactionEvent.current.active) {
        reactionEvent.current = { active: true, appearedAt: now, expiresAt: now + 900, x: 40 + Math.random() * (W - 80), y: 36 + Math.random() * (H - 80), hit: false };
        nextReactionAt.current = e + 1.4 + Math.random() * 2.6;
      }
      if (reactionEvent.current.active && now > reactionEvent.current.expiresAt) {
        reactionEvent.current.active = false;
        setMissedEvents((v) => v + 1);
      }

      if (e < TEST_DURATION) rafRef.current = requestAnimationFrame(loop);
      else {
        doneRef.current = true;
        const alertness = Math.round(Math.max(0, Math.min(100, coordinationScore - missedEvents * 4 - falseTaps * 2)));
        const history = getStoredResults();
        const baseline = history.length
          ? {
              reactionAvgMs: history.reduce((a, r) => a + r.reactionAvgMs, 0) / history.length,
              coordinationScore: history.reduce((a, r) => a + r.coordinationScore, 0) / history.length,
              alertnessScore: history.reduce((a, r) => a + r.alertnessScore, 0) / history.length,
            }
          : null;
        const deviation = baseline
          ? {
              reactionPct: pctDelta(reactionTimes.current.length ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length : 550, baseline.reactionAvgMs, false),
              coordinationPct: pctDelta(coordinationScore, baseline.coordinationScore, true),
              alertnessPct: pctDelta(alertness, baseline.alertnessScore, true),
            }
          : null;

        const poorReaction = (reactionAvg || 999) > 480;
        const lowCoord = coordinationScore < 58;
        const highMissed = missedEvents >= 4;
        const baselineDrop = deviation ? (deviation.reactionPct > 20 || deviation.coordinationPct > 18 || deviation.alertnessPct > 18) : false;
        const badCount = [poorReaction, lowCoord, highMissed, baselineDrop].filter(Boolean).length;
        const decision: Decision = badCount >= 3 ? "AT RISK" : badCount >= 1 ? "CAUTION" : "FIT";
        const reasons: string[] = [];
        if (deviation && deviation.reactionPct > 0) reasons.push(`Reaction time is ${Math.round(deviation.reactionPct)}% slower than baseline.`);
        if (coordinationScore >= 72) reasons.push("Coordination remained stable throughout the test.");
        if (highMissed) reasons.push(`Missed ${missedEvents} reaction events during the test window.`);
        if (!reasons.length) reasons.push("All tracked readiness factors remained within expected range.");

        const current: TestResult = {
          durationSec: TEST_DURATION,
          reactionAvgMs: reactionAvg || 0,
          coordinationScore,
          alertnessScore: alertness,
          missedEvents,
          falseTaps,
          modeUsed: mode,
          decision,
          reasons,
          deviation,
        };
        const next = [...history, { reactionAvgMs: current.reactionAvgMs || 0, coordinationScore: current.coordinationScore, alertnessScore: current.alertnessScore }].slice(-30);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setTimeout(() => onComplete(current), 350);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [coordinationScore, falseTaps, missedEvents, mode, onComplete, reactionAvg, tapReaction, tiltGranted]);

  const progress = Math.min(1, elapsed / TEST_DURATION);
  const target = targetRef.current;
  const user = userRef.current;
  const evt = reactionEvent.current;

  return <div className="flex flex-1 flex-col" style={{ color: "var(--fg)" }}>
    <div className="flex items-center justify-between px-6 py-4"><span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>Adaptive tracking · level {Math.round(4 + progress * 6)}</span><span className="font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>{`00:${Math.floor(elapsed).toString().padStart(2, "0")}`}</span></div>
    <div className="px-6 pb-2 flex items-center justify-between">
      <div className="inline-flex rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
        <button onClick={() => setMode("touch")} className="px-3 py-1.5 text-[11px] font-mono" style={{ color: mode === "touch" ? "var(--fg)" : "var(--fg-subtle)" }}>Touch</button>
        <button onClick={() => (tiltAvailable ? requestTiltPermission() : setMode("touch"))} className="px-3 py-1.5 text-[11px] font-mono" style={{ color: mode === "tilt" ? "var(--fg)" : "var(--fg-subtle)" }}>Tilt Mode</button>
      </div>
      <span className="font-mono text-[10px]" style={{ color: "var(--fg-subtle)" }}>{tiltAvailable ? (tiltGranted ? "Tilt sensor ready" : "Tilt permission required") : "Tilt not supported"}</span>
    </div>
    <div className="flex-1 flex items-center justify-center" onClick={tapReaction}>
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", maxWidth: "100%" }} onPointerDown={handlePointer} onPointerMove={handlePointer}>
        <circle cx={160} cy={198} r={112} stroke="var(--border)" fill="none" />
        <circle cx={160} cy={198} r={74} stroke="var(--border)" fill="none" />
        <line x1={target.x} y1={target.y} x2={user.x} y2={user.y} stroke="var(--fg)" strokeOpacity="0.2" strokeDasharray="2 3" />
        <circle cx={target.x} cy={target.y} r={16} fill="none" stroke="var(--success)" strokeWidth="1.8" />
        <circle cx={target.x} cy={target.y} r={3.5} fill="var(--success)" />
        <circle cx={user.x} cy={user.y} r={10} fill="var(--accent)" opacity="0.14" />
        <circle cx={user.x} cy={user.y} r={5} fill="var(--fg)" />
        {evt.active && <g><circle cx={evt.x} cy={evt.y} r={14} fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke="var(--warning)" /><circle cx={evt.x} cy={evt.y} r={3} fill="var(--warning)" /></g>}
      </svg>
    </div>
    <div className="grid grid-cols-3 gap-4 px-6 pb-4">{[
      ["REACTION", `${reactionAvg || "--"}`, "ms", "ok"],
      ["COORDINATION", `${coordinationScore}`, "score", coordinationScore < 60 ? "warn" : "ok"],
      ["MISSED", `${missedEvents}`, "events", missedEvents > 2 ? "warn" : "ok"],
    ].map(([l,v,u,t]) => <div key={String(l)}><div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>{l}</div><div className="mt-1 font-mono text-[24px] font-semibold leading-none" style={{ color: t === "warn" ? "var(--warning)" : "var(--fg)" }}>{v}<span style={{ fontSize: 11, color: "var(--fg-subtle)", marginLeft: 2 }}>{u}</span></div></div>)}</div>
    <div className="px-6 pb-6"><div className="mb-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }}><div style={{ width: `${progress * 100}%`, height: 4, background: "var(--accent)" }} /></div></div>
  </div>;
}

function ResultScreen({ result, onRetry }: { result: TestResult; onRetry: () => void }) {
  const history = useMemo(() => getStoredResults(), []);
  const baseline = history.length > 1
    ? {
        reactionAvgMs: Math.round(history.slice(0, -1).reduce((a, r) => a + r.reactionAvgMs, 0) / (history.length - 1)),
        coordinationScore: Math.round(history.slice(0, -1).reduce((a, r) => a + r.coordinationScore, 0) / (history.length - 1)),
        alertnessScore: Math.round(history.slice(0, -1).reduce((a, r) => a + r.alertnessScore, 0) / (history.length - 1)),
      }
    : null;
  const factors: { label: string; value: string; detail: string; tone: "ok" | "warn" | "err" }[] = [
    { label: "Reaction time", value: `${result.reactionAvgMs || "--"} ms`, detail: baseline ? `baseline ${baseline.reactionAvgMs} ms` : "Baseline will be created after first completed test.", tone: result.reactionAvgMs > 480 ? "err" : "ok" as const },
    { label: "Coordination", value: `${result.coordinationScore}`, detail: baseline ? `baseline ${baseline.coordinationScore}` : "Awaiting baseline", tone: result.coordinationScore < 60 ? "warn" : "ok" as const },
    { label: "Alertness", value: `${result.alertnessScore}`, detail: baseline ? `baseline ${baseline.alertnessScore}` : "Awaiting baseline", tone: result.alertnessScore < 58 ? "warn" : "ok" as const },
  ];

  return <div className="flex flex-1 flex-col px-6 py-5" style={{ color: "var(--fg)" }}>
    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>Result · {result.decision}</div>
    <h1 className="mt-4 text-[26px] font-semibold">{result.decision === "FIT" ? "Ready for shift." : result.decision === "CAUTION" ? "Proceed with caution." : "Supervisor review advised."}</h1>
    <div className="mt-5 rounded-xl p-4" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
      <div className="eyebrow mb-2">Final summary</div>
      <div className="grid grid-cols-2 gap-2 text-[12px]" style={{ color: "var(--fg-muted)" }}>
        <div>Test duration</div><div className="font-mono" style={{ color: "var(--fg)" }}>{result.durationSec}s</div>
        <div>Reaction average</div><div className="font-mono" style={{ color: "var(--fg)" }}>{result.reactionAvgMs || "--"} ms</div>
        <div>Coordination score</div><div className="font-mono" style={{ color: "var(--fg)" }}>{result.coordinationScore}</div>
        <div>Missed events</div><div className="font-mono" style={{ color: "var(--fg)" }}>{result.missedEvents}</div>
        <div>Mode used</div><div className="font-mono" style={{ color: "var(--fg)" }}>{result.modeUsed === "tilt" ? "Tilt" : "Touch"}</div>
        <div>Final decision</div><div className="font-mono" style={{ color: toneColor(result.decision === "AT RISK" ? "err" : result.decision === "CAUTION" ? "warn" : "ok") }}>{result.decision}</div>
      </div>
      <div className="mt-3 text-[12px]" style={{ color: "var(--fg-muted)" }}>{result.reasons[0]}</div>
      <div className="mt-2 text-[11px]" style={{ color: "var(--fg-subtle)" }}>Prototype only — not a medical or occupational assessment tool.</div>
      {result.deviation && <div className="mt-2 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>Deviation: R {Math.round(result.deviation.reactionPct)}% · C {Math.round(result.deviation.coordinationPct)}% · A {Math.round(result.deviation.alertnessPct)}%</div>}
      <div className="mt-3 grid gap-2">{factors.map((factor) => <div key={factor.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}><div><div className="text-[12px] font-medium">{factor.label}</div><div className="font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>{factor.detail}</div></div><span className="font-mono text-[13px] font-semibold" style={{ color: toneColor(factor.tone) }}>{factor.value}</span></div>)}</div>
    </div>
    <button onClick={onRetry} className="mt-auto h-12 rounded-xl text-[14px] font-medium" style={{ background: "var(--accent)", color: "var(--white)", border: "none", boxShadow: "var(--shadow-button)", cursor: "pointer" }}>Done</button>
  </div>;
}

export function WorkerCompanion() {
  const [stage, setStage] = useState<Stage>("pre");
  const [result, setResult] = useState<TestResult | null>(null);

  return <div className="flex min-h-dvh items-start justify-center sm:items-center sm:p-6" style={{ background: "var(--bg)" }}>
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden sm:max-h-[calc(100dvh-48px)] sm:min-h-[720px] sm:max-w-[390px] sm:rounded-[24px]" style={{ background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between" style={{ display: stage === "test" ? "none" : "flex" }}>
        <Link href="/" className="inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}><ArrowLeft className="h-3 w-3" />roles</Link>
        <Link href="/" aria-label="Log out" className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium" style={{ color: "var(--fg-muted)", border: "1px solid var(--border)", background: "var(--bg-elev)" }}><LogOut className="h-3 w-3" />Log out</Link>
      </div>
      <div className="flex flex-1 flex-col pt-8">
        {stage === "pre" && <PreShiftScreen onStart={() => setStage("test")} />}
        {stage === "test" && <TestScreen onComplete={(r) => { setResult(r); setStage("result"); }} />}
        {stage === "result" && result && <ResultScreen result={result} onRetry={() => setStage("pre")} />}
      </div>
    </div>
  </div>;
}
