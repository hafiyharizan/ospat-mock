"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Factory,
  Gauge,
  MapPin,
  Minus,
  RadioTower,
  Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SiteSummary } from "@/lib/types";

type Tone = "ok" | "warn" | "err";

const MAP_BOUNDS = {
  minLatitude: -44.2,
  maxLatitude: -10.1,
  minLongitude: 112.0,
  maxLongitude: 154.4,
};

const TONE_STYLES: Record<Tone, { color: string; soft: string; label: string }> = {
  ok: {
    color: "var(--success)",
    soft: "color-mix(in oklch, var(--success) 12%, transparent)",
    label: "Stable",
  },
  warn: {
    color: "var(--warning)",
    soft: "color-mix(in oklch, var(--warning) 14%, transparent)",
    label: "Watch",
  },
  err: {
    color: "var(--danger)",
    soft: "color-mix(in oklch, var(--danger) 14%, transparent)",
    label: "Escalate",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function projectSite(site: SiteSummary) {
  const x =
    ((site.longitude - MAP_BOUNDS.minLongitude) /
      (MAP_BOUNDS.maxLongitude - MAP_BOUNDS.minLongitude)) *
    100;
  const y =
    ((MAP_BOUNDS.maxLatitude - site.latitude) /
      (MAP_BOUNDS.maxLatitude - MAP_BOUNDS.minLatitude)) *
    100;

  return {
    x: clamp(x, 8, 92),
    y: clamp(y, 10, 88),
  };
}

function getSiteTone(site: SiteSummary): Tone {
  if (site.flagged >= 3 || site.avgReadiness < 68 || site.trend14d < -4) {
    return "err";
  }
  if (site.flagged > 0 || site.avgReadiness < 76 || site.trend14d < 0) {
    return "warn";
  }
  return "ok";
}

function formatTrend(value: number) {
  if (value === 0) return "0.0%";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function SiteOperationsMap({ sites }: { sites: SiteSummary[] }) {
  const sortedSites = useMemo(
    () =>
      sites.slice().sort((a, b) => {
        if (b.flagged !== a.flagged) return b.flagged - a.flagged;
        return a.avgReadiness - b.avgReadiness;
      }),
    [sites],
  );

  const [selectedSiteId, setSelectedSiteId] = useState(
    () => sortedSites[0]?.siteId ?? sites[0]?.siteId ?? "",
  );

  const selectedSite =
    sites.find((site) => site.siteId === selectedSiteId) ?? sortedSites[0] ?? sites[0];

  const selectedPoint = selectedSite ? projectSite(selectedSite) : { x: 50, y: 50 };
  const selectedTone = selectedSite ? getSiteTone(selectedSite) : "ok";
  const selectedToneStyle = TONE_STYLES[selectedTone];
  const totalAssessments = sites.reduce((sum, site) => sum + site.assessments, 0);
  const totalFlagged = sites.reduce((sum, site) => sum + site.flagged, 0);
  const averageReadiness = sites.length
    ? sites.reduce((sum, site) => sum + site.avgReadiness, 0) / sites.length
    : 0;

  if (!selectedSite) {
    return null;
  }

  const TrendIcon =
    selectedSite.trend14d > 0 ? ArrowUpRight : selectedSite.trend14d < 0 ? ArrowDownRight : Minus;

  return (
    <section className="card mb-4 w-full max-w-full min-w-0 overflow-hidden sm:mb-5">
      <div className="grid min-w-0 lg:grid-cols-[1.35fr_0.95fr]">
        <div
          className="relative min-h-[370px] min-w-0 overflow-hidden border-b lg:border-b-0 lg:border-r"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, var(--bg-sunken), var(--bg-elev)), radial-gradient(circle at 70% 25%, color-mix(in oklch, var(--accent) 13%, transparent), transparent 32%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(var(--border-faint) 1px, transparent 1px), linear-gradient(90deg, var(--border-faint) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative z-10 flex min-w-0 flex-col items-start gap-3 p-4 sm:flex-row sm:justify-between sm:p-5">
            <div>
              <div className="eyebrow mb-1">Operational map</div>
              <h2
                className="text-[20px] font-semibold leading-tight sm:text-[24px]"
                style={{ color: "var(--fg)", letterSpacing: "-0.018em" }}
              >
                Site readiness network
              </h2>
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              <MapMetric icon={RadioTower} label="Sites" value={sites.length} />
              <MapMetric icon={Activity} label="Checks" value={totalAssessments} />
              <MapMetric icon={AlertTriangle} label="Flagged" value={totalFlagged} tone="err" />
            </div>
          </div>

          <svg
            aria-hidden="true"
            className="absolute inset-x-0 bottom-4 top-20 h-[calc(100%-96px)] w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="site-map-fill" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--bg-elev)" />
                <stop offset="100%" stopColor="var(--selected-bg)" />
              </linearGradient>
            </defs>
            <path
              d="M25 24C31 17 42 16 51 13C59 15 66 20 73 26C82 28 87 36 86 45C92 53 88 63 80 68C74 75 64 75 57 80C48 84 38 81 32 75C24 74 17 68 13 59C8 49 11 38 18 32C18 28 21 26 25 24Z"
              fill="url(#site-map-fill)"
              stroke="var(--border-strong)"
              strokeWidth="1.2"
            />
            <path
              d="M63 86C67 84 72 85 75 88C72 91 67 91 63 89Z"
              fill="var(--bg-elev)"
              stroke="var(--border-strong)"
              strokeWidth="1.1"
            />
            {sites.map((site) => {
              const point = projectSite(site);
              return (
                <line
                  key={`${site.siteId}-route`}
                  x1={selectedPoint.x}
                  y1={selectedPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke={
                    site.siteId === selectedSite.siteId
                      ? selectedToneStyle.color
                      : "color-mix(in oklch, var(--fg-faint) 38%, transparent)"
                  }
                  strokeWidth={site.siteId === selectedSite.siteId ? 0 : 0.75}
                  strokeDasharray="3 4"
                  opacity={site.siteId === selectedSite.siteId ? 0 : 0.68}
                />
              );
            })}
          </svg>

          {sites.map((site) => {
            const point = projectSite(site);
            const tone = getSiteTone(site);
            const toneStyle = TONE_STYLES[tone];
            const selected = site.siteId === selectedSite.siteId;
            const markerSize = Math.min(44, 28 + site.flagged * 4);

            return (
              <button
                key={site.siteId}
                type="button"
                aria-label={`${site.siteName}, ${toneStyle.label}, ${site.flagged} flagged today`}
                aria-pressed={selected}
                onClick={() => setSelectedSiteId(site.siteId)}
                className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: markerSize,
                  height: markerSize,
                  color: toneStyle.color,
                  background: selected ? toneStyle.soft : "var(--bg-elev)",
                  border: `1px solid ${selected ? toneStyle.color : "var(--border-strong)"}`,
                  boxShadow: selected
                    ? `0 0 0 8px ${toneStyle.soft}, var(--shadow-md)`
                    : "var(--shadow-sm)",
                  ["--tw-ring-color" as string]: toneStyle.color,
                  ["--tw-ring-offset-color" as string]: "var(--bg)",
                }}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: toneStyle.soft }}
                />
                <MapPin className="relative h-4 w-4" strokeWidth={selected ? 2.5 : 2} />
              </button>
            );
          })}

          <div
            className="absolute bottom-4 left-4 right-4 z-20 rounded-lg p-3 sm:left-5 sm:right-auto sm:w-[310px]"
            style={{
              background: "color-mix(in oklch, var(--bg-elev) 92%, transparent)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <div className="eyebrow mb-1">{selectedSite.region}</div>
                <div className="truncate text-[16px] font-semibold" style={{ color: "var(--fg)" }}>
                  {selectedSite.siteName}
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--fg-subtle)" }}>
                  {selectedSite.type}
                </div>
              </div>
              <span
                className="badge"
                style={{
                  color: selectedToneStyle.color,
                  background: selectedToneStyle.soft,
                  borderColor: `color-mix(in oklch, ${selectedToneStyle.color} 28%, transparent)`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: selectedToneStyle.color }} />
                {selectedToneStyle.label}
              </span>
            </div>
          </div>
        </div>

        <aside className="flex min-h-[370px] min-w-0 flex-col overflow-hidden">
          <div className="border-b p-4 sm:p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow mb-1">Selected site</div>
                <h3
                  className="text-[20px] font-semibold leading-tight"
                  style={{ color: "var(--fg)", letterSpacing: "-0.015em" }}
                >
                  {selectedSite.siteName}
                </h3>
              </div>
              <Factory className="h-5 w-5 shrink-0" style={{ color: selectedToneStyle.color }} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <InspectorMetric icon={Gauge} label="Readiness" value={selectedSite.avgReadiness.toFixed(1)} />
              <InspectorMetric icon={AlertTriangle} label="Flagged" value={selectedSite.flagged} tone="err" />
              <InspectorMetric icon={Activity} label="Checks" value={selectedSite.assessments} />
              <InspectorMetric icon={Route} label="Risk shift" value={selectedSite.highestRiskShift} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-md px-3 py-2" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <TrendIcon
                  className="h-4 w-4"
                  style={{
                    color:
                      selectedSite.trend14d > 0
                        ? "var(--success)"
                        : selectedSite.trend14d < 0
                          ? "var(--danger)"
                          : "var(--warning)",
                  }}
                />
                <span className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
                  14-day readiness drift
                </span>
              </div>
              <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                {formatTrend(selectedSite.trend14d)}
              </span>
            </div>
          </div>

          <div className="flex-1 p-2">
            {sortedSites.map((site) => {
              const tone = getSiteTone(site);
              const toneStyle = TONE_STYLES[tone];
              const selected = site.siteId === selectedSite.siteId;

              return (
                <button
                  key={site.siteId}
                  type="button"
                  onClick={() => setSelectedSiteId(site.siteId)}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-all duration-150 hover:bg-[var(--hover-bg)] focus:outline-none focus-visible:ring-2"
                  style={{
                    background: selected ? "var(--selected-bg)" : "transparent",
                    border: `1px solid ${selected ? "var(--border-strong)" : "transparent"}`,
                    ["--tw-ring-color" as string]: toneStyle.color,
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: toneStyle.soft,
                        color: toneStyle.color,
                        border: `1px solid color-mix(in oklch, ${toneStyle.color} 28%, transparent)`,
                      }}
                    >
                      {tone === "ok" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                        {site.siteName}
                      </span>
                      <span className="block truncate text-[11px]" style={{ color: "var(--fg-subtle)" }}>
                        {site.region}
                      </span>
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[12px]" style={{ color: "var(--fg-muted)" }}>
                      {site.avgReadiness.toFixed(1)}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: site.flagged ? "var(--danger)" : "var(--success)" }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="grid grid-cols-2 gap-0 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <FooterMetric label="Network avg" value={averageReadiness.toFixed(1)} />
            <FooterMetric label="Flag rate" value={`${Math.round((totalFlagged / Math.max(totalAssessments, 1)) * 100)}%`} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function MapMetric({
  icon: Icon,
  label,
  value,
  tone = "ok",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <div
      className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
      style={{
        background: "color-mix(in oklch, var(--bg-elev) 88%, transparent)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: toneStyle.color }} />
      <span className="font-mono text-[12px] font-semibold" style={{ color: "var(--fg)" }}>
        {value}
      </span>
      <span className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>
        {label}
      </span>
    </div>
  );
}

function InspectorMetric({
  icon: Icon,
  label,
  value,
  tone = "ok",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <div className="rounded-md p-3" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: toneStyle.color }} />
        <div className="eyebrow">{label}</div>
      </div>
      <div className="font-mono text-[21px] font-semibold leading-none" style={{ color: "var(--fg)", fontFeatureSettings: '"tnum"' }}>
        {value}
      </div>
    </div>
  );
}

function FooterMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3" style={{ borderRight: "1px solid var(--border)" }}>
      <div className="eyebrow mb-1">{label}</div>
      <div className="font-mono text-[18px] font-semibold leading-none" style={{ color: "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}
