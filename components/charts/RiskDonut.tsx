"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartColors } from "@/lib/useChartColors";

const COLORS: Record<string, string> = {
  Pass:   "#10996b",
  Review: "#d39200",
  Fail:   "#c8392b",
};
const LABELS: Record<string, string> = { Pass: "Pass", Review: "Retest", Fail: "Flag" };

export function RiskDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const c = useChartColors();
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            innerRadius="60%" outerRadius="85%"
            stroke={c.dotStroke} strokeWidth={2} paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "var(--fg-faint)"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: c.tooltipBorder, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: c.tooltipLabel }}
            itemStyle={{ color: c.tooltipItem }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-mono text-[30px] font-semibold leading-none"
          style={{ color: "var(--fg)", letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }}
        >
          {total}
        </div>
        <div className="eyebrow mt-1">today</div>
      </div>
    </div>
  );
}

export function RiskDonutLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex flex-wrap gap-4 px-5 py-3">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: COLORS[d.name] ?? "var(--fg-faint)" }} />
          <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{LABELS[d.name] ?? d.name}</span>
          <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--fg)", fontFeatureSettings: '"tnum"' }}>
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
