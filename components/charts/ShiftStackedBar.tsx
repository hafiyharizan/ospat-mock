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

export function ShiftStackedBar({
  data,
}: {
  data: { shift: string; Monitor: number; Review: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="shift"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "rgba(9,9,11,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#a1a1aa" }}
          itemStyle={{ color: "#e4e4e7" }}
        />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
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
