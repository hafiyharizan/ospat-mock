"use client";

import Link from "next/link";
import type { DashboardKpis } from "@/lib/types";

interface Props {
  kpis: DashboardKpis;
}

const PEOPLE = [
  {
    name: "Marcus Tran",   id: "#W-2841", score: 52, band: [68, 84],
    data: [76,78,80,75,79,82,77,73,70,68,71,66,64,62,58,60,55,53,54,52],
    signal: "Drift · 4 shifts below personal band", conf: 0.92,
    site: "Mt Whaleback · Pit 4", tone: "err",
  },
  {
    name: "Joseph Okafor", id: "#W-1192", score: 48, band: [70, 88],
    data: [82,84,80,79,81,78,77,80,82,79,76,78,74,72,70,68,65,60,54,48],
    signal: "Sharp drop · single shift", conf: 0.97,
    site: "Loadout B", tone: "err",
  },
  {
    name: "Sarah Park",    id: "#W-3304", score: 64, band: [62, 78],
    data: [70,72,68,74,71,69,73,70,66,68,64,67,65,63,64,66,65,62,64,64],
    signal: "In band · Mon-AM cluster", conf: 0.71,
    site: "Workshop 2", tone: "warn",
  },
  {
    name: "Liam Romero",   id: "#W-0827", score: 81, band: [72, 86],
    data: [60,62,58,64,66,70,72,74,75,76,78,77,79,80,79,81,82,80,81,81],
    signal: "Recovery · back in band", conf: 0.88,
    site: "Haul Rd 7", tone: "ok",
  },
];

const AI_SIGNALS = [
  { tone: "err",  kicker: "CLUSTER",  text: "6 workers on Crew B testing below personal band on Monday mornings.", meta: "Pilbara · 92% conf" },
  { tone: "warn", kicker: "PREDICT",  text: "23 workers projected below band tomorrow based on rolling fatigue signal.", meta: "next 24h · 78% conf" },
  { tone: "ok",   kicker: "RECOVERY", text: "Liam Romero back in personal range after 14 days of intervention.", meta: "closes case #C-2210" },
  { tone: "warn", kicker: "DRIFT",    text: "M. Tran below personal mean for 4 consecutive shifts. Recommend 1:1.", meta: "#W-2841 · 92% conf" },
];

function toneColor(t: string) {
  if (t === "err")  return "var(--danger)";
  if (t === "warn") return "var(--warning)";
  return "var(--success)";
}

function Sparkline({
  data, band, width = 140, height = 32, danger = false,
}: {
  data: number[]; band: number[]; width?: number; height?: number; danger?: boolean;
}) {
  const allVals = [...data, ...band];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const pad = 2;
  const sx = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const sy = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];

  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <rect
        x={pad} y={sy(band[1])}
        width={width - pad * 2} height={Math.max(0, sy(band[0]) - sy(band[1]))}
        fill="var(--success)" opacity="0.10"
      />
      <path d={d} stroke={danger ? "var(--danger)" : "var(--fg-muted)"} strokeWidth="1.4" fill="none" />
      <circle
        cx={sx(data.length - 1)} cy={sy(last)} r="3"
        fill={danger ? "var(--danger)" : "var(--success)"}
        stroke="var(--bg-elev)" strokeWidth="1.5"
      />
    </svg>
  );
}

function WaveChart() {
  const W = 800, H = 120;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 90; i++) {
    const x = (i / 90) * W;
    const base = H * 0.55;
    const y = base - Math.sin(i * 0.18) * 20 - Math.sin(i * 0.07 + 1.2) * 12 - Math.sin(i * 0.32) * 5;
    pts.push([x, y]);
  }
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  const dots: { x: number; k: string; y: number }[] = [
    { x: 80,  k: "ok"   }, { x: 145, k: "ok"   }, { x: 210, k: "err"  },
    { x: 275, k: "ok"   }, { x: 350, k: "warn"  }, { x: 420, k: "ok"   },
    { x: 490, k: "ok"   }, { x: 560, k: "err"   }, { x: 625, k: "ok"   },
    { x: 690, k: "ok"   }, { x: 755, k: "warn"  }, { x: 790, k: "ok"   },
  ].map((dot) => ({
    ...dot,
    y: pts[Math.round((dot.x / W) * 90)]?.[1] ?? H * 0.55,
  }));

  const times = ["05:30","05:45","06:00","06:15","06:30","06:45"];

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" y1={H * t} x2={W} y2={H * t}
            stroke="var(--border-faint)" strokeWidth="1" strokeDasharray="2 4" />
        ))}
        <path d={fillPath} fill="url(#wfill)" />
        <path d={linePath} stroke="var(--accent)" strokeWidth="1.5" fill="none" />
        {dots.map((dot, i) => {
          const c = toneColor(dot.k);
          return (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r={dot.k === "err" ? 4.5 : 3.5}
                fill={c} stroke="var(--bg-elev)" strokeWidth="1.5" />
            </g>
          );
        })}
        {times.map((t, i) => (
          <text key={t} x={(i / (times.length - 1)) * W} y={H - 3}
            fontFamily="var(--font-mono)" fontSize="10"
            fill="var(--fg-subtle)"
            textAnchor={i === 0 ? "start" : i === times.length - 1 ? "end" : "middle"}>
            {t}
          </text>
        ))}
      </svg>
      <div style={{
        position: "absolute", left: "66%", top: 4,
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        color: "var(--danger)", letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        ↓ J. Okafor · 48 · flagged 06:38
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2);
}

export function LiveDashboard({ kpis }: Props) {
  const passRate = kpis.totalToday
    ? ((kpis.pass / kpis.totalToday) * 100).toFixed(1)
    : "—";

  const kpiCards = [
    {
      label: "Tested · today",
      value: kpis.totalToday.toString(),
      suffix: `/ ${(kpis.totalToday + 372).toLocaleString()}`,
      delta: "↑ 14 / min", deltaTone: "ok",
    },
    {
      label: "Pass rate",
      value: passRate,
      suffix: "%",
      delta: "↑ 0.4 · 24h", deltaTone: "ok",
    },
    {
      label: "Flagged",
      value: kpis.fail.toString(),
      delta: `↑ ${Math.max(1, Math.floor(kpis.fail * 0.4))} · 24h`, deltaTone: "err",
    },
    {
      label: "Predicted at-risk",
      value: "23",
      suffix: "next 24h",
      delta: "model · 78% conf", deltaTone: "flat",
    },
  ];

  return (
    <div className="flex h-full min-h-0" style={{ background: "var(--bg)" }}>
      {/* ── Main column */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 min-w-0">

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <div key={card.label} className="card-padded" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="text-[12.5px] font-medium" style={{ color: "var(--fg-muted)" }}>
                {card.label}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-mono text-[26px] font-semibold leading-none"
                  style={{ color: "var(--fg)", letterSpacing: "-0.01em", fontFeatureSettings: '"tnum"' }}
                >
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-[13px]" style={{ color: "var(--fg-subtle)" }}>
                    {card.suffix}
                  </span>
                )}
              </div>
              {card.delta && (
                <div
                  className="flex items-center gap-1 font-mono text-[11.5px]"
                  style={{
                    color: card.deltaTone === "ok" ? "var(--success)"
                         : card.deltaTone === "err" ? "var(--danger)"
                         : "var(--fg-muted)",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {card.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Wave panel */}
        <div className="card overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
              Shift-start wave
            </span>
            <span className="font-mono text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
              last 90 min · 14 sites
            </span>
            <div className="ml-auto flex gap-2">
              {[
                { label: `${kpis.pass} pass`, tone: "ok" },
                { label: `${kpis.review} retest`, tone: "warn" },
                { label: `${kpis.fail} flag`, tone: "err" },
              ].map(({ label, tone }) => (
                <span key={label} className={`badge badge-${tone}`}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(tone) }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4 pb-2 pt-3">
            <WaveChart />
          </div>
        </div>

        {/* Needs attention table */}
        <div className="card flex flex-col overflow-hidden">
          <div
            className="flex items-center px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>
              Needs attention
            </span>
            <span className="ml-3 font-mono text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
              {PEOPLE.length} workers · sorted by AI confidence
            </span>
            <div className="ml-auto flex gap-2">
              <button className="btn-ghost h-[26px] px-2.5 text-[12px]">Filter</button>
              <button className="btn-secondary h-[26px] px-2.5 text-[12px]">Export</button>
            </div>
          </div>

          {/* Table head */}
          <div
            className="grid px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.04em]"
            style={{
              gridTemplateColumns: "1.5fr 80px 160px 1.8fr 1fr 88px",
              gap: 12,
              background: "var(--bg-sunken)",
              borderBottom: "1px solid var(--border)",
              color: "var(--fg-subtle)",
            }}
          >
            <div>Worker</div>
            <div>Today</div>
            <div>20-shift trend</div>
            <div>AI signal</div>
            <div>Site</div>
            <div style={{ textAlign: "right" }}>Action</div>
          </div>

          {/* Rows */}
          {PEOPLE.map((p, i) => (
            <div
              key={p.id}
              className="grid px-5 items-center"
              style={{
                gridTemplateColumns: "1.5fr 80px 160px 1.8fr 1fr 88px",
                gap: 12,
                height: 64,
                borderBottom: i < PEOPLE.length - 1 ? "1px solid var(--border-faint)" : "none",
                fontSize: 13,
              }}
            >
              {/* Worker */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold"
                  style={{
                    background: "var(--bg-sunken)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-muted)",
                  }}
                >
                  {initials(p.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium" style={{ color: "var(--fg)" }}>{p.name}</div>
                  <div className="font-mono text-[11px]" style={{ color: "var(--fg-subtle)" }}>{p.id}</div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-mono text-[22px] font-semibold leading-none"
                  style={{
                    color: p.tone === "err" ? "var(--danger)" : "var(--fg)",
                    letterSpacing: "-0.01em",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {p.score}
                </span>
              </div>

              {/* Sparkline */}
              <div>
                <Sparkline data={p.data} band={p.band} width={150} height={32} danger={p.tone === "err"} />
                <div className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--fg-faint)" }}>
                  band {p.band[0]}–{p.band[1]}
                </div>
              </div>

              {/* Signal */}
              <div>
                <div className="text-[12.5px] leading-snug" style={{ color: "var(--fg)" }}>
                  {p.signal}
                </div>
                <div
                  className="mt-1 flex items-center gap-1.5 font-mono text-[10.5px]"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  confidence
                  <div
                    className="relative h-[3px] w-14 rounded-full overflow-hidden"
                    style={{ background: "var(--neutral-100)" }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${p.conf * 100}%`,
                        background: toneColor(p.tone),
                      }}
                    />
                  </div>
                  {(p.conf * 100).toFixed(0)}%
                </div>
              </div>

              {/* Site */}
              <div className="font-mono text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>
                {p.site}
              </div>

              {/* Action */}
              <div style={{ textAlign: "right" }}>
                <Link
                  href={`/employees/${p.id.replace("#W-", "emp-")}`}
                  className={p.tone === "err" ? "btn-primary" : "btn-secondary"}
                  style={{ height: 26, padding: "0 10px", fontSize: 12 }}
                >
                  {p.tone === "err" ? "Route" : "Open"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right rail: AI patterns */}
      <aside
        className="hidden xl:flex xl:w-80 xl:flex-shrink-0 xl:flex-col gap-3 overflow-y-auto p-5"
        style={{ borderLeft: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow">Patterns</span>
          <span className="badge badge-info">beta</span>
        </div>

        <h2
          className="text-[17px] font-semibold leading-snug"
          style={{ color: "var(--fg)", letterSpacing: "-0.012em" }}
        >
          What the model sees this week
        </h2>

        <div className="flex flex-col gap-2.5">
          {AI_SIGNALS.map((sig, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: "12px 14px" }}
            >
              <div className="mb-1.5">
                <span className={`badge badge-${sig.tone}`}>{sig.kicker}</span>
              </div>
              <p className="text-[12.5px] leading-snug" style={{ color: "var(--fg)" }}>
                {sig.text}
              </p>
              <p className="mt-2 font-mono text-[10.5px]" style={{ color: "var(--fg-subtle)" }}>
                {sig.meta}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-auto text-[11px] leading-relaxed pt-3"
          style={{
            borderTop: "1px solid var(--border-faint)",
            color: "var(--fg-subtle)",
          }}
        >
          The model surfaces signals — never diagnoses cause. Decisions stay with supervisors, per OSPAT principle.
        </div>
      </aside>
    </div>
  );
}
