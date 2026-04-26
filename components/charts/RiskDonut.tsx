"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartColors } from "@/lib/useChartColors";

const COLORS: Record<string, string> = {
  Cleared: "#34d399",
  Monitor: "#fbbf24",
  "Review Required": "#fb7185",
};

export function RiskDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const c = useChartColors();

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="85%"
            stroke={c.dotStroke}
            strokeWidth={2}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] ?? "#71717a"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: c.tooltipBg,
              border: c.tooltipBorder,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: c.tooltipLabel }}
            itemStyle={{ color: c.tooltipItem }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-zinc-900 dark:text-white">{total}</div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          today
        </div>
      </div>
    </div>
  );
}

export function RiskDonutLegend({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-3 px-5 pb-4">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: COLORS[d.name] ?? "#71717a" }}
          />
          <span className="text-zinc-500">{d.name}</span>
          <span className="text-zinc-800 dark:text-zinc-100 font-semibold tabular-nums">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

