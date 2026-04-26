"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "@/lib/useChartColors";

export function SiteBarChart({
  data,
}: {
  data: { siteName: string; count: number }[];
}) {
  const c = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="siteName"
          tick={{ fill: c.axisTick, fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: c.axisLine }}
          interval={0}
        />
        <YAxis
          tick={{ fill: c.axisTick, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: c.tooltipCursor }}
          contentStyle={{
            background: c.tooltipBg,
            border: c.tooltipBorder,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: c.tooltipLabel }}
          itemStyle={{ color: c.tooltipItem }}
          formatter={(v: number) => [v, "Assessments"]}
        />
        <Bar
          dataKey="count"
          fill="url(#bar-grad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={64}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

