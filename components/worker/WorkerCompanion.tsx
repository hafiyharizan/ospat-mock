"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, RotateCcw } from "lucide-react";
import { toneColor } from "@/lib/risk";

type Stage = "pre" | "test" | "result";
type TestMode = "touch" | "tilt";
type Decision = "FIT" | "CAUTION" | "AT RISK";
type Tone = "ok" | "warn" | "err";

type Baseline = {
  createdAt: string;
  durationSec: number;
  mode: TestMode;
  avgReactionMs: number | null;
  coordinationScore: number;
  missedEvents: number;
  falseTaps: number;
  readinessScore: number;
};

type TestMetrics = {
  durationSec: number;
  mode: TestMode;
  avgReactionMs: number | null;
  coordinationScore: number;
  missedEvents: number;
  falseTaps: number;
  totalEvents: number;
  hitEvents: number;
  readinessScore: number;
};

type TestResult = TestMetrics & {
  completedAt: string;
  baseline: Baseline | null;
  reactionDeviationPct: number | null;
  scoreDeviationPct: number | null;
  decision: Decision;
  explanations: string[];
};

type ActiveEvent = {
  id: number;
  startedAt: number;
  expiresAt: number;
};

type LiveStats = {
  elapsed: number;
  avgReactionMs: number | null;
  coordinationScore: number;
  missedEvents: number;
  falseTaps: number;
  totalEvents: number;
  hitEvents: number;
  eventActive: boolean;
  difficultyLevel: number;
  readinessScore: number;
};

type MutableStats = {
  elapsed: number;
  reactionSumMs: number;
  hitEvents: number;
  missedEvents: number;
  falseTaps: number;
  totalEvents: number;
  coordinationSum: number;
  coordinationSamples: number;
};

const BASELINE_KEY = "shift.worker.baseline.v1";
const TEST_DURATION_SEC = 30;
const RESPONSE_WINDOW_MS = 1050;
const TARGET_HIT_RADIUS = 38;
const TARGET_IDLE_RADIUS = 24;
const TARGET_ACTIVE_RADIUS = 34;
const TARGET_CENTER_IDLE_RADIUS = 6;
const TARGET_CENTER_ACTIVE_RADIUS = 8;
const USER_HALO_RADIUS = 34;
const USER_DOT_RADIUS = 9;

const WORKER = {
  name: "Marcus Tran",
  id: "#W-2841",
  site: "Pit 4 · Mt Whaleback",
  supervisor: "Reg Cooper",
  supervisorRole: "Shift Lead",
  supervisorDistance: "80 m away",
  score: 52,
  band: [68, 84] as [number, number],
  history: [76, 78, 80, 75, 79, 82, 77, 73, 70, 68, 71, 66, 64, 62, 58, 60, 55, 53, 54, 52],
};

const TEST_FACTORS = [
  { label: "Touch reaction", detail: "timed event response" },
  { label: "Coordination control", detail: "target tracking accuracy" },
  { label: "Baseline comparison", detail: "personal drift check" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function formatDuration(seconds: number) {
  return `${seconds.toFixed(0)} sec`;
}

function formatReaction(value: number | null) {
  return value === null ? "No valid response" : `${value} ms`;
}

function formatCompactReaction(value: number | null) {
  return value === null ? "Waiting" : `${value}`;
}

function formatSignedPct(value: number | null) {
  if (value === null) return "Not available";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatReactionDeviation(value: number | null) {
  if (value === null) return "No reaction baseline yet";
  if (Math.abs(value) < 1) return "Reaction time is aligned with baseline";
  return `Reaction time is ${Math.abs(value).toFixed(1)}% ${value > 0 ? "slower" : "faster"} than baseline`;
}

function decisionTone(decision: Decision): Tone {
  if (decision === "AT RISK") return "err";
  if (decision === "CAUTION") return "warn";
  return "ok";
}

function reactionScore(avgReactionMs: number | null) {
  if (avgReactionMs === null) return 35;
  return clamp(100 - (avgReactionMs - 220) * 0.13, 30, 100);
}

function buildReadinessScore(metrics: Omit<TestMetrics, "readinessScore">) {
  const accuracyScore = metrics.totalEvents > 0 ? (metrics.hitEvents / metrics.totalEvents) * 100 : 0;
  const score =
    metrics.coordinationScore * 0.5 +
    reactionScore(metrics.avgReactionMs) * 0.32 +
    accuracyScore * 0.18 -
    metrics.falseTaps * 1.4 -
    metrics.missedEvents * 2.5;

  return round(clamp(score, 0, 100));
}

function createBaseline(metrics: TestMetrics): Baseline {
  return {
    createdAt: new Date().toISOString(),
    durationSec: metrics.durationSec,
    mode: metrics.mode,
    avgReactionMs: metrics.avgReactionMs,
    coordinationScore: metrics.coordinationScore,
    missedEvents: metrics.missedEvents,
    falseTaps: metrics.falseTaps,
    readinessScore: metrics.readinessScore,
  };
}

function readBaseline(): Baseline | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(BASELINE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Baseline>;
    if (
      typeof parsed.createdAt !== "string" ||
      typeof parsed.durationSec !== "number" ||
      typeof parsed.coordinationScore !== "number" ||
      typeof parsed.missedEvents !== "number" ||
      typeof parsed.falseTaps !== "number" ||
      typeof parsed.readinessScore !== "number" ||
      (parsed.mode !== "touch" && parsed.mode !== "tilt")
    ) {
      return null;
    }

    return {
      createdAt: parsed.createdAt,
      durationSec: parsed.durationSec,
      mode: parsed.mode,
      avgReactionMs: typeof parsed.avgReactionMs === "number" ? parsed.avgReactionMs : null,
      coordinationScore: parsed.coordinationScore,
      missedEvents: parsed.missedEvents,
      falseTaps: parsed.falseTaps,
      readinessScore: parsed.readinessScore,
    };
  } catch {
    return null;
  }
}

function saveBaseline(metrics: TestMetrics) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BASELINE_KEY, JSON.stringify(createBaseline(metrics)));
  } catch {
    // Private browsing or locked-down devices should still complete the test.
  }
}

function buildResult(metrics: TestMetrics, baseline: Baseline | null): TestResult {
  const reactionDeviationPct =
    baseline?.avgReactionMs && metrics.avgReactionMs
      ? ((metrics.avgReactionMs - baseline.avgReactionMs) / baseline.avgReactionMs) * 100
      : null;
  const scoreDeviationPct = baseline
    ? ((metrics.readinessScore - baseline.readinessScore) / Math.max(1, baseline.readinessScore)) * 100
    : null;

  const warnings: string[] = [];
  const severe: string[] = [];

  if (metrics.avgReactionMs === null) {
    severe.push("No valid reaction response was recorded.");
  } else if (metrics.avgReactionMs >= 650) {
    severe.push(`Average reaction time was high at ${metrics.avgReactionMs} ms.`);
  } else if (metrics.avgReactionMs >= 500) {
    warnings.push(`Reaction time was slower than expected at ${metrics.avgReactionMs} ms.`);
  }

  if (metrics.coordinationScore < 55) {
    severe.push(`Coordination score was low at ${metrics.coordinationScore}/100.`);
  } else if (metrics.coordinationScore < 70) {
    warnings.push(`Coordination score was reduced at ${metrics.coordinationScore}/100.`);
  }

  if (metrics.missedEvents >= 4) {
    severe.push(`${metrics.missedEvents} reaction events were missed.`);
  } else if (metrics.missedEvents >= 2) {
    warnings.push(`${metrics.missedEvents} reaction events were missed.`);
  }

  if (metrics.falseTaps >= 5) {
    warnings.push(`${metrics.falseTaps} false taps were recorded.`);
  }

  if (reactionDeviationPct !== null) {
    if (reactionDeviationPct >= 25) {
      severe.push(`Reaction time is ${reactionDeviationPct.toFixed(1)}% slower than baseline.`);
    } else if (reactionDeviationPct >= 12) {
      warnings.push(`Reaction time is ${reactionDeviationPct.toFixed(1)}% slower than baseline.`);
    }
  }

  if (scoreDeviationPct !== null) {
    if (scoreDeviationPct <= -20) {
      severe.push(`Readiness score is ${Math.abs(scoreDeviationPct).toFixed(1)}% below baseline.`);
    } else if (scoreDeviationPct <= -10) {
      warnings.push(`Readiness score is ${Math.abs(scoreDeviationPct).toFixed(1)}% below baseline.`);
    }
  }

  const decision: Decision = severe.length > 0 || warnings.length >= 3 ? "AT RISK" : warnings.length > 0 ? "CAUTION" : "FIT";
  const explanations =
    severe.length > 0 || warnings.length > 0
      ? [...severe, ...warnings].slice(0, 3)
      : [
          baseline
            ? "Coordination remained stable throughout the test."
            : "Coordination remained stable during the completed screen.",
          baseline ? formatReactionDeviation(reactionDeviationPct) : "Baseline will be created after first completed test.",
        ];

  return {
    ...metrics,
    completedAt: new Date().toISOString(),
    baseline,
    reactionDeviationPct,
    scoreDeviationPct,
    decision,
    explanations,
  };
}

function Sparkline() {
  const W = 260;
  const H = 60;
  const pad = 4;
  const data = WORKER.history;
  const [lo, hi] = WORKER.band;
  const min = Math.min(...data, lo) - 2;
  const max = Math.max(...data, hi) + 2;
  const sx = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const sy = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect
        x={pad}
        y={sy(hi)}
        width={W - pad * 2}
        height={Math.max(0, sy(lo) - sy(hi))}
        fill="var(--success)"
        opacity="0.12"
      />
      <path d={d} stroke="var(--fg)" strokeWidth="1.5" fill="none" />
      <circle
        cx={sx(data.length - 1)}
        cy={sy(data[data.length - 1])}
        r="4"
        fill="var(--danger)"
        stroke="var(--bg-elev)"
        strokeWidth="2"
      />
    </svg>
  );
}

function ScoreDonut({ score, tone }: { score: number; tone: Tone }) {
  const R = 36;
  const C = 2 * Math.PI * R;
  const pct = clamp(score / 100, 0, 1);
  const color = toneColor(tone);

  return (
    <svg width={88} height={88}>
      <circle
        cx={44}
        cy={44}
        r={R}
        stroke={`color-mix(in oklch, ${color} 15%, transparent)`}
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx={44}
        cy={44}
        r={R}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      <text
        x={44}
        y={44}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontSize="22"
        fontWeight="600"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

function MetricTile({
  label,
  value,
  unit,
  tone = "ok",
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: Tone;
}) {
  return (
    <div
      className="min-w-0 rounded-lg px-3 py-2"
      style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
    >
      <div
        className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--fg-subtle)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 truncate font-mono text-[20px] font-semibold leading-none"
        style={{ color: tone === "ok" ? "var(--fg)" : toneColor(tone), letterSpacing: "0" }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 10, color: "var(--fg-subtle)", marginLeft: 2 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function PreShiftScreen({
  onStart,
  starting,
  modeNotice,
}: {
  onStart: () => void;
  starting: boolean;
  modeNotice?: string;
}) {
  return (
    <div className="flex flex-1 flex-col px-6 py-5" style={{ color: "var(--fg)" }}>
      <div
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--fg-subtle)" }}
      >
        05:48 · {WORKER.site}
      </div>

      <h1 className="mt-4 text-[30px] font-semibold leading-tight" style={{ color: "var(--fg)", letterSpacing: "0" }}>
        Morning, {WORKER.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        Complete a measured 30 second reaction and coordination screen before shift starts.
      </p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Input mode</span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>
            Touch
          </span>
        </div>
        <div
          className="rounded-xl px-3 py-3"
          style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                Finger tracking
              </div>
              <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                Drag inside the large ring and tap amber targets.
              </p>
            </div>
            <span className="badge badge-info">active</span>
          </div>
        </div>
        {modeNotice && (
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--warning)" }}>
            {modeNotice}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {TEST_FACTORS.map((factor) => (
          <div
            key={factor.label}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
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

      <div
        className="mt-5 rounded-xl p-4"
        style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Last 20 shifts</span>
          <span className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
            band {WORKER.band[0]}-{WORKER.band[1]}
          </span>
        </div>
        <Sparkline />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>
            Last result
          </span>
          <span className="font-mono text-[12px] font-semibold" style={{ color: "var(--danger)" }}>
            {WORKER.score} · below band
          </span>
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        Follow the moving marker and tap the target when it turns amber. Your supervisor sees the result,{" "}
        <strong style={{ color: "var(--fg)" }}>not a diagnosis.</strong>
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          onClick={onStart}
          disabled={starting}
          className="h-12 w-full rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-70"
          style={{
            background: "var(--accent)",
            color: "var(--white)",
            border: "none",
            boxShadow: "var(--shadow-button)",
            cursor: starting ? "wait" : "pointer",
          }}
        >
          {starting ? "Starting check..." : "Start measured check-in"}
        </button>
        <div className="text-center font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
          {WORKER.id} · biometric verified
        </div>
      </div>
    </div>
  );
}

function TestScreen({
  mode,
  modeNotice,
  onComplete,
}: {
  mode: TestMode;
  modeNotice?: string;
  onComplete: (metrics: TestMetrics) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const targetCircleRef = useRef<SVGCircleElement>(null);
  const targetCenterRef = useRef<SVGCircleElement>(null);
  const userCircleRef = useRef<SVGCircleElement>(null);
  const userHaloRef = useRef<SVGCircleElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const connLineRef = useRef<SVGLineElement>(null);
  const progressBarRef = useRef<SVGRectElement>(null);
  const timerTextRef = useRef<HTMLSpanElement>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const doneRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const activeEventRef = useRef<ActiveEvent | null>(null);
  const eventIdRef = useRef(0);
  const nextEventAtRef = useRef(1.5);
  const lastUiTickRef = useRef(-1);
  const orientationSeenRef = useRef(false);
  const tiltRef = useRef({ beta: 0, gamma: 0 });
  const positionsRef = useRef<Array<[number, number]>>([]);
  const pointRef = useRef({
    targetX: 160,
    targetY: 198,
    userX: 160,
    userY: 198,
  });
  const statsRef = useRef<MutableStats>({
    elapsed: 0,
    reactionSumMs: 0,
    hitEvents: 0,
    missedEvents: 0,
    falseTaps: 0,
    totalEvents: 0,
    coordinationSum: 0,
    coordinationSamples: 0,
  });
  const [live, setLive] = useState<LiveStats>({
    elapsed: 0,
    avgReactionMs: null,
    coordinationScore: 100,
    missedEvents: 0,
    falseTaps: 0,
    totalEvents: 0,
    hitEvents: 0,
    eventActive: false,
    difficultyLevel: 1,
    readinessScore: 100,
  });
  const [sensorNotice, setSensorNotice] = useState(modeNotice);

  const W = 320;
  const H = 380;
  const CX = W / 2;
  const CY = H * 0.52;
  const R = 112;
  const BAR_W = W - 48;

  const getLiveStats = useCallback((): LiveStats => {
    const stats = statsRef.current;
    const avgReactionMs = stats.hitEvents > 0 ? round(stats.reactionSumMs / stats.hitEvents) : null;
    const coordinationBase =
      stats.coordinationSamples > 0 ? (stats.coordinationSum / stats.coordinationSamples) * 100 : 100;
    const coordinationScore = round(
      clamp(coordinationBase - stats.missedEvents * 3.5 - stats.falseTaps * 1.6, 0, 100),
    );
    const metricsWithoutScore = {
      durationSec: TEST_DURATION_SEC,
      mode,
      avgReactionMs,
      coordinationScore,
      missedEvents: stats.missedEvents,
      falseTaps: stats.falseTaps,
      totalEvents: stats.totalEvents,
      hitEvents: stats.hitEvents,
    };

    return {
      elapsed: stats.elapsed,
      avgReactionMs,
      coordinationScore,
      missedEvents: stats.missedEvents,
      falseTaps: stats.falseTaps,
      totalEvents: stats.totalEvents,
      hitEvents: stats.hitEvents,
      eventActive: activeEventRef.current !== null,
      difficultyLevel: clamp(round(1 + (stats.elapsed / TEST_DURATION_SEC) * 5), 1, 6),
      readinessScore: buildReadinessScore(metricsWithoutScore),
    };
  }, [mode]);

  const syncLive = useCallback(() => {
    setLive(getLiveStats());
  }, [getLiveStats]);

  const scheduleNextEvent = useCallback((elapsed: number) => {
    const progress = clamp(elapsed / TEST_DURATION_SEC, 0, 1);
    nextEventAtRef.current = elapsed + 2.1 + Math.random() * (1.5 - progress * 0.6);
  }, []);

  const startReactionEvent = useCallback(
    (now: number) => {
      eventIdRef.current += 1;
      activeEventRef.current = {
        id: eventIdRef.current,
        startedAt: now,
        expiresAt: now + RESPONSE_WINDOW_MS,
      };
      statsRef.current.totalEvents += 1;
      syncLive();
    },
    [syncLive],
  );

  const missActiveEvent = useCallback(() => {
    if (!activeEventRef.current) return;
    activeEventRef.current = null;
    statsRef.current.missedEvents += 1;
    scheduleNextEvent(statsRef.current.elapsed);
    syncLive();
  }, [scheduleNextEvent, syncLive]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  const finishTest = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (activeEventRef.current) {
      activeEventRef.current = null;
      statsRef.current.missedEvents += 1;
    }

    const finalLive = getLiveStats();
    onCompleteRef.current({
      durationSec: TEST_DURATION_SEC,
      mode,
      avgReactionMs: finalLive.avgReactionMs,
      coordinationScore: finalLive.coordinationScore,
      missedEvents: finalLive.missedEvents,
      falseTaps: finalLive.falseTaps,
      totalEvents: finalLive.totalEvents,
      hitEvents: finalLive.hitEvents,
      readinessScore: finalLive.readinessScore,
    });
  }, [getLiveStats, mode]);

  const setUserPoint = useCallback(
    (x: number, y: number) => {
      const clampedX = clamp(x, 24, W - 24);
      const clampedY = clamp(y, 42, H - 42);
      pointRef.current.userX = clampedX;
      pointRef.current.userY = clampedY;
    },
    [H, W],
  );

  const getSvgPoint = useCallback((event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    return { x, y };
  }, [H, W]);

  const attemptReaction = useCallback(
    (x: number, y: number, now: number) => {
      if (doneRef.current) return;

      const targetDistance = Math.hypot(x - pointRef.current.targetX, y - pointRef.current.targetY);
      const insideTarget = targetDistance <= TARGET_HIT_RADIUS;
      const activeEvent = activeEventRef.current;

      if (activeEvent && now <= activeEvent.expiresAt && insideTarget) {
        statsRef.current.hitEvents += 1;
        statsRef.current.reactionSumMs += now - activeEvent.startedAt;
        activeEventRef.current = null;
        scheduleNextEvent(statsRef.current.elapsed);
        syncLive();
        return;
      }

      statsRef.current.falseTaps += 1;
      syncLive();
    },
    [scheduleNextEvent, syncLive],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const point = getSvgPoint(event);
      if (!point) return;

      event.preventDefault();
      pointerActiveRef.current = true;
      if (mode === "touch") setUserPoint(point.x, point.y);
      attemptReaction(point.x, point.y, performance.now());

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some mobile browsers do not support pointer capture on SVG nodes.
      }
    },
    [attemptReaction, getSvgPoint, mode, setUserPoint],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (mode !== "touch") return;
      if (!pointerActiveRef.current && event.pointerType !== "mouse") return;

      const point = getSvgPoint(event);
      if (!point) return;
      setUserPoint(point.x, point.y);
    },
    [getSvgPoint, mode, setUserPoint],
  );

  const handlePointerEnd = useCallback(() => {
    pointerActiveRef.current = false;
  }, []);

  useEffect(() => {
    if (mode !== "tilt" || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.beta !== "number" || typeof event.gamma !== "number") return;
      orientationSeenRef.current = true;
      tiltRef.current = { beta: event.beta, gamma: event.gamma };
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [mode]);

  useEffect(() => {
    doneRef.current = false;
    pointerActiveRef.current = false;
    activeEventRef.current = null;
    eventIdRef.current = 0;
    nextEventAtRef.current = 1.5;
    lastUiTickRef.current = -1;
    positionsRef.current = [];
    pointRef.current = {
      targetX: CX,
      targetY: CY,
      userX: CX,
      userY: CY,
    };
    statsRef.current = {
      elapsed: 0,
      reactionSumMs: 0,
      hitEvents: 0,
      missedEvents: 0,
      falseTaps: 0,
      totalEvents: 0,
      coordinationSum: 0,
      coordinationSamples: 0,
    };
    setLive({
      elapsed: 0,
      avgReactionMs: null,
      coordinationScore: 100,
      missedEvents: 0,
      falseTaps: 0,
      totalEvents: 0,
      hitEvents: 0,
      eventActive: false,
      difficultyLevel: 1,
      readinessScore: 100,
    });

    const start = performance.now();
    let lastSensorNoticeAt = 0;

    const loop = (now: number) => {
      if (doneRef.current) return;

      const elapsed = clamp((now - start) / 1000, 0, TEST_DURATION_SEC);
      const progress = elapsed / TEST_DURATION_SEC;
      const speed = 0.72 + progress * 0.55;
      const spread = 0.62 + progress * 0.16;
      const jitter = 0.08 + progress * 0.2;
      const targetX =
        CX +
        Math.sin(elapsed * speed * 1.2) * R * spread +
        Math.sin(elapsed * 2.1 + 1.7) * R * jitter;
      const targetY =
        CY +
        Math.sin(elapsed * speed * 1.7 + 0.4) * R * (spread * 0.66) +
        Math.cos(elapsed * 2.6) * R * jitter * 0.72;

      pointRef.current.targetX = clamp(targetX, 32, W - 32);
      pointRef.current.targetY = clamp(targetY, 54, H - 54);

      if (mode === "tilt") {
        const desiredX = CX + clamp(tiltRef.current.gamma, -28, 28) * (R / 28);
        const desiredY = CY + clamp(tiltRef.current.beta, -28, 28) * (R / 28);
        pointRef.current.userX += (clamp(desiredX, 24, W - 24) - pointRef.current.userX) * 0.16;
        pointRef.current.userY += (clamp(desiredY, 42, H - 42) - pointRef.current.userY) * 0.16;

        if (!orientationSeenRef.current && elapsed > 4 && elapsed - lastSensorNoticeAt > 4) {
          lastSensorNoticeAt = elapsed;
          setSensorNotice("Waiting for tilt sensor data. You can still tap amber targets.");
        }
      }

      statsRef.current.elapsed = elapsed;
      if (!activeEventRef.current && elapsed >= nextEventAtRef.current && elapsed < TEST_DURATION_SEC - 1.4) {
        startReactionEvent(now);
      }

      if (activeEventRef.current && now > activeEventRef.current.expiresAt) {
        missActiveEvent();
      }

      const distance = Math.hypot(
        pointRef.current.userX - pointRef.current.targetX,
        pointRef.current.userY - pointRef.current.targetY,
      );
      const trackingScore = 1 - clamp(distance / 122, 0, 1);
      statsRef.current.coordinationSum += trackingScore;
      statsRef.current.coordinationSamples += 1;

      if (targetCircleRef.current) {
        targetCircleRef.current.setAttribute("cx", pointRef.current.targetX.toFixed(2));
        targetCircleRef.current.setAttribute("cy", pointRef.current.targetY.toFixed(2));
      }
      if (targetCenterRef.current) {
        targetCenterRef.current.setAttribute("cx", pointRef.current.targetX.toFixed(2));
        targetCenterRef.current.setAttribute("cy", pointRef.current.targetY.toFixed(2));
      }
      if (userCircleRef.current) {
        userCircleRef.current.setAttribute("cx", pointRef.current.userX.toFixed(2));
        userCircleRef.current.setAttribute("cy", pointRef.current.userY.toFixed(2));
      }
      if (userHaloRef.current) {
        userHaloRef.current.setAttribute("cx", pointRef.current.userX.toFixed(2));
        userHaloRef.current.setAttribute("cy", pointRef.current.userY.toFixed(2));
      }
      if (connLineRef.current) {
        connLineRef.current.setAttribute("x1", pointRef.current.targetX.toFixed(2));
        connLineRef.current.setAttribute("y1", pointRef.current.targetY.toFixed(2));
        connLineRef.current.setAttribute("x2", pointRef.current.userX.toFixed(2));
        connLineRef.current.setAttribute("y2", pointRef.current.userY.toFixed(2));
      }

      positionsRef.current.push([pointRef.current.userX, pointRef.current.userY]);
      if (positionsRef.current.length > 44) positionsRef.current.shift();
      if (trailRef.current && positionsRef.current.length > 1) {
        const d = positionsRef.current
          .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(" ");
        trailRef.current.setAttribute("d", d);
      }

      if (progressBarRef.current) {
        progressBarRef.current.setAttribute("width", (progress * BAR_W).toFixed(1));
      }

      if (timerTextRef.current) {
        const seconds = Math.floor(elapsed).toString().padStart(2, "0");
        timerTextRef.current.textContent = `00:${seconds}`;
      }
      if (countdownRef.current) {
        countdownRef.current.textContent = `${Math.max(0, Math.ceil(TEST_DURATION_SEC - elapsed))}s LEFT`;
      }

      const uiTick = Math.floor(elapsed * 8);
      if (uiTick !== lastUiTickRef.current) {
        lastUiTickRef.current = uiTick;
        syncLive();
      }

      if (elapsed >= TEST_DURATION_SEC) {
        window.setTimeout(finishTest, 280);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      doneRef.current = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [BAR_W, CX, CY, H, R, W, finishTest, missActiveEvent, mode, startReactionEvent, syncLive]);

  const reactionTone: Tone =
    live.avgReactionMs === null ? "warn" : live.avgReactionMs >= 650 ? "err" : live.avgReactionMs >= 500 ? "warn" : "ok";
  const coordinationTone: Tone = live.coordinationScore < 55 ? "err" : live.coordinationScore < 70 ? "warn" : "ok";
  const missedTone: Tone = live.missedEvents >= 4 ? "err" : live.missedEvents >= 2 ? "warn" : "ok";
  const falseTapTone: Tone = live.falseTaps >= 5 ? "warn" : "ok";

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <span
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: "var(--fg-subtle)" }}
          >
            {mode === "tilt" ? "Tilt mode" : "Touch mode"} · level {live.difficultyLevel}
          </span>
          <div className="mt-1 text-[12px]" style={{ color: live.eventActive ? "var(--warning)" : "var(--fg-muted)" }}>
            {live.eventActive ? "Tap the amber target now" : "Track the moving target"}
          </div>
        </div>
        <span ref={timerTextRef} className="font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
          00:00
        </span>
      </div>

      {sensorNotice && (
        <div className="mx-6 mb-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}>
          {sensorNotice}
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center px-3">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
            touchAction: "none",
            cursor: mode === "touch" ? "crosshair" : "pointer",
          }}
        >
          {[R, R * 0.67, R * 0.33].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} stroke="var(--border)" fill="none" />
          ))}
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="var(--border-faint)" strokeWidth="1" />
          <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="var(--border-faint)" strokeWidth="1" />
          <path ref={trailRef} d="" stroke="var(--accent)" strokeWidth="1.2" fill="none" opacity="0.38" strokeLinecap="round" />
          <line
            ref={connLineRef}
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY}
            stroke="var(--fg)"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <circle
            ref={targetCircleRef}
            cx={CX}
            cy={CY}
            r={live.eventActive ? TARGET_ACTIVE_RADIUS : TARGET_IDLE_RADIUS}
            fill={
              live.eventActive
                ? "color-mix(in oklch, var(--warning) 16%, transparent)"
                : "color-mix(in oklch, var(--success) 7%, transparent)"
            }
            stroke={live.eventActive ? "var(--warning)" : "var(--success)"}
            strokeWidth={live.eventActive ? "3.25" : "2.25"}
          />
          <circle
            ref={targetCenterRef}
            cx={CX}
            cy={CY}
            r={live.eventActive ? TARGET_CENTER_ACTIVE_RADIUS : TARGET_CENTER_IDLE_RADIUS}
            fill={live.eventActive ? "var(--warning)" : "var(--success)"}
            stroke="var(--bg)"
            strokeWidth="2"
          />
          <circle
            ref={userHaloRef}
            cx={CX}
            cy={CY}
            r={USER_HALO_RADIUS}
            fill="var(--accent)"
            opacity="0.16"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeOpacity="0.55"
          />
          <circle
            ref={userCircleRef}
            cx={CX}
            cy={CY}
            r={USER_DOT_RADIUS}
            fill="var(--fg)"
            stroke="var(--bg)"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-6 pb-4">
        <MetricTile label="Reaction" value={formatCompactReaction(live.avgReactionMs)} unit={live.avgReactionMs === null ? undefined : "ms"} tone={reactionTone} />
        <MetricTile label="Coordination" value={live.coordinationScore} unit="score" tone={coordinationTone} />
        <MetricTile label="Missed" value={`${live.missedEvents}/${live.totalEvents}`} tone={missedTone} />
        <MetricTile label="False taps" value={live.falseTaps} tone={falseTapTone} />
      </div>

      <div className="px-6 pb-6">
        <div className="mb-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
          <svg width="100%" height={4}>
            <rect ref={progressBarRef} x={0} y={0} width={0} height={4} fill="var(--accent)" rx={2} />
          </svg>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: "var(--fg-subtle)" }}
          >
            measured prototype
          </span>
          <span
            ref={countdownRef}
            className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: "var(--fg-subtle)" }}
          >
            {TEST_DURATION_SEC}s LEFT
          </span>
        </div>
      </div>
    </div>
  );
}

function BaselineComparison({ result }: { result: TestResult }) {
  if (!result.baseline) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
        <div className="eyebrow mb-2">Baseline comparison</div>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Baseline will be created after first completed test.
        </p>
      </div>
    );
  }

  const rows = [
    ["Current result", `${result.readinessScore}/100`],
    ["Baseline", `${result.baseline.readinessScore}/100`],
    ["Deviation", formatSignedPct(result.scoreDeviationPct)],
  ];

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">Baseline comparison</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.06em]" style={{ color: "var(--fg-subtle)" }}>
          personal only
        </span>
      </div>
      <div className="grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
              {label}
            </span>
            <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 text-[12px] leading-relaxed" style={{ borderTop: "1px solid var(--border-faint)", color: "var(--fg-muted)" }}>
        {formatReactionDeviation(result.reactionDeviationPct)}
      </div>
    </div>
  );
}

function SummaryPanel({ result }: { result: TestResult }) {
  const summary = [
    ["Test duration", formatDuration(result.durationSec)],
    ["Reaction average", formatReaction(result.avgReactionMs)],
    ["Coordination score", `${result.coordinationScore}/100`],
    ["Missed events", `${result.missedEvents}/${result.totalEvents}`],
    ["Mode used", result.mode === "tilt" ? "Tilt" : "Touch"],
    ["Final decision", result.decision],
  ];

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
      <div className="eyebrow mb-3">Interview summary</div>
      <div className="grid gap-2.5">
        {summary.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
              {label}
            </span>
            <span
              className="text-right font-mono text-[13px] font-semibold"
              style={{ color: label === "Final decision" ? toneColor(decisionTone(result.decision)) : "var(--fg)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ result, onRetry }: { result: TestResult; onRetry: () => void }) {
  const tone = decisionTone(result.decision);
  const accentColor = toneColor(tone);
  const supervisorRequired = result.decision !== "FIT";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5" style={{ color: "var(--fg)" }}>
      <div
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--fg-subtle)" }}
      >
        Result · measured worker test
      </div>

      <h1 className="mt-4 text-[26px] font-semibold leading-tight" style={{ color: "var(--fg)", letterSpacing: "0" }}>
        {result.decision === "FIT" ? "Ready for shift." : result.decision === "CAUTION" ? "Caution before shift." : "See supervisor now."}
      </h1>

      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {result.decision === "FIT"
          ? "Result is inside the prototype readiness rules for this worker."
          : "This screen flagged measurable drift. It is a workflow alert, not a diagnosis."}
      </p>

      <div
        className="mt-5 rounded-xl p-4"
        style={{
          background: `color-mix(in oklch, ${accentColor} 8%, var(--bg))`,
          border: `1px solid color-mix(in oklch, ${accentColor} 25%, transparent)`,
        }}
      >
        <div className="flex items-center gap-4">
          <ScoreDonut score={result.readinessScore} tone={tone} />
          <div className="min-w-0 flex-1">
            <span className={`badge ${tone === "err" ? "badge-err" : tone === "warn" ? "badge-warn" : "badge-ok"}`}>
              {result.decision}
            </span>
            <div className="mt-2 text-[16px] font-semibold" style={{ color: "var(--fg)" }}>
              Readiness {result.readinessScore}/100
            </div>
            <div className="mt-1 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
              transparent rules · no medical claim
            </div>
          </div>
        </div>

        <div
          className="mt-4 grid gap-2 pt-3"
          style={{ borderTop: `1px solid color-mix(in oklch, ${accentColor} 18%, transparent)` }}
        >
          {result.explanations.map((explanation) => (
            <div key={explanation} className="text-[12.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              <span className="font-semibold" style={{ color: accentColor }}>
                Rule:
              </span>{" "}
              {explanation}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <BaselineComparison result={result} />
        <SummaryPanel result={result} />
      </div>

      {supervisorRequired && (
        <div className="mt-3 rounded-xl p-4" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)" }}>
          <div className="eyebrow mb-3">Routed to</div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-semibold"
              style={{ background: "var(--neutral-700)", color: "var(--white)" }}
            >
              RC
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                {WORKER.supervisor}
              </div>
              <div className="truncate text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                {WORKER.supervisorRole} · {WORKER.supervisorDistance}
              </div>
            </div>
            <span className="badge badge-ok">
              <span className="h-1.5 w-1.5 rounded-full animate-shift-pulse" style={{ background: "var(--success)" }} />
              notified
            </span>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11.5px] leading-relaxed" style={{ color: "var(--fg-subtle)" }}>
        Prototype only — not a medical or occupational assessment tool.
      </p>

      <div className="sticky bottom-0 -mx-6 mt-auto flex gap-2.5 px-6 py-5" style={{ background: "linear-gradient(180deg, transparent, var(--bg) 24%)" }}>
        <button
          onClick={onRetry}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-[14px] font-medium"
          style={{
            background: "var(--bg-elev)",
            color: "var(--fg)",
            border: "1px solid var(--border-strong)",
            cursor: "pointer",
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Run again
        </button>
        <Link
          href="/"
          className="flex h-12 flex-[1.15] items-center justify-center rounded-xl text-[14px] font-semibold"
          style={{
            background: accentColor,
            color: "var(--white)",
            border: "none",
            boxShadow: "var(--shadow-button)",
          }}
        >
          {supervisorRequired ? "Acknowledge" : "Done"}
        </Link>
      </div>
    </div>
  );
}

export function WorkerCompanion() {
  const [stage, setStage] = useState<Stage>("pre");
  const [activeMode, setActiveMode] = useState<TestMode>("touch");
  const [modeNotice, setModeNotice] = useState<string>();
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const baselineAtStartRef = useRef<Baseline | null>(null);

  const handleStart = useCallback(() => {
    setStarting(true);
    const baseline = readBaseline();

    baselineAtStartRef.current = baseline;
    setActiveMode("touch");
    setModeNotice(undefined);
    setResult(null);
    setStage("test");
    setStarting(false);
  }, []);

  const handleComplete = useCallback((metrics: TestMetrics) => {
    const baseline = baselineAtStartRef.current;
    const completedResult = buildResult(metrics, baseline);

    if (!baseline) saveBaseline(metrics);

    setResult(completedResult);
    setStage("result");
  }, []);

  const handleRetry = useCallback(() => {
    setStage("pre");
  }, []);

  return (
    <div className="flex min-h-dvh items-start justify-center sm:items-center sm:p-6" style={{ background: "var(--bg)" }}>
      <div
        className="relative flex min-h-dvh w-full flex-col overflow-hidden sm:max-h-[calc(100dvh-48px)] sm:min-h-[720px] sm:max-w-[390px] sm:rounded-[24px]"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="absolute inset-x-4 top-4 z-20 flex items-center justify-between"
          style={{ display: stage === "test" ? "none" : "flex" }}
        >
          <Link href="/" className="inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>
            <ArrowLeft className="h-3 w-3" />
            roles
          </Link>
          <Link
            href="/"
            aria-label="Log out"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium"
            style={{
              color: "var(--fg-muted)",
              border: "1px solid var(--border)",
              background: "var(--bg-elev)",
            }}
          >
            <LogOut className="h-3 w-3" />
            Log out
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col pt-8">
          {stage === "pre" && (
            <PreShiftScreen
              onStart={handleStart}
              starting={starting}
              modeNotice={modeNotice}
            />
          )}
          {stage === "test" && <TestScreen mode={activeMode} modeNotice={modeNotice} onComplete={handleComplete} />}
          {stage === "result" && result && <ResultScreen result={result} onRetry={handleRetry} />}
        </div>
      </div>
    </div>
  );
}
