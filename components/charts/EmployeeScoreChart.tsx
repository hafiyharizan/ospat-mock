"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "@/lib/useChartColors";

export function EmployeeScoreChart({
  data,
  baseline,
}: {
  data: { idx: number; score: number; label: string }[];
  baseline: number;
}) {
  const c = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: c.axisTick, fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: c.axisLine }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[40, 100]}
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
          formatter={(v: number) => [Number(v).toFixed(1), "Readiness"]}
        />
        <ReferenceLine
          y={baseline}
          stroke="var(--accent)"
          strokeDasharray="4 4"
          label={{
            value: `Own baseline ${baseline.toFixed(1)}`,
            fill: "var(--accent)",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />
        <ReferenceLine
          y={baseline * 0.85}
          stroke="var(--danger)"
          strokeDasharray="2 4"
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent)", stroke: c.dotStroke, strokeWidth: 1 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

