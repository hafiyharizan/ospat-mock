"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "@/lib/useChartColors";

export function ShiftStackedBar({
  data,
}: {
  data: { shift: string; Monitor: number; Review: number }[];
}) {
  const c = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="shift"
          tick={{ fill: c.axisTick, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: c.axisLine }}
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
        />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 11, color: c.tooltipLabel }}
        />
        <Bar
          dataKey="Monitor"
          stackId="a"
          fill="#fbbf24"
          radius={[0, 0, 0, 0]}
          maxBarSize={56}
        />
        <Bar
          dataKey="Review"
          stackId="a"
          fill="#fb7185"
          radius={[6, 6, 0, 0]}
          maxBarSize={56}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

