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
import { useChartColors } from "@/lib/useChartColors";

export function TrendLineChart({
  data,
}: {
  data: { date: string; avg: number }[];
}) {
  const c = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a8a7a" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#5a8a7a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: c.axisTick, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: c.axisLine }}
          tickFormatter={(d: string) => d.slice(5)}
        />
        <YAxis
          domain={[60, 100]}
          tick={{ fill: c.axisTick, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: c.tooltipBorder,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: c.tooltipLabel }}
          itemStyle={{ color: c.tooltipItem }}
          formatter={(v: number) => [v.toFixed(1), "Avg score"]}
        />
        <Area
          type="monotone"
          dataKey="avg"
          stroke="#5a8a7a"
          strokeWidth={2}
          fill="url(#trend-grad)"
          dot={false}
          activeDot={{ r: 4, stroke: "#5a8a7a", strokeWidth: 2, fill: c.dotStroke }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

