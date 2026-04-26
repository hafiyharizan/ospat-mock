"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrendLineChart({
  data,
}: {
  data: { date: string; avg: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickFormatter={(d: string) => d.slice(5)}
        />
        <YAxis
          domain={[60, 100]}
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(9,9,11,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#a1a1aa" }}
          itemStyle={{ color: "#e4e4e7" }}
          formatter={(v: number) => [v.toFixed(1), "Avg score"]}
        />
        <Area
          type="monotone"
          dataKey="avg"
          stroke="#a5b4fc"
          strokeWidth={2}
          fill="url(#trend-grad)"
          dot={false}
          activeDot={{ r: 4, stroke: "#818cf8", strokeWidth: 2, fill: "#0a0a0b" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
