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

export function EmployeeScoreChart({
  data,
  baseline,
}: {
  data: { idx: number; score: number; label: string }[];
  baseline: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#71717a", fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[40, 100]}
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
          formatter={(v: number) => [v, "Score"]}
        />
        <ReferenceLine
          y={baseline}
          stroke="rgba(165,180,252,0.5)"
          strokeDasharray="4 4"
          label={{
            value: `Baseline ${baseline}`,
            fill: "#a5b4fc",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />
        <ReferenceLine
          y={baseline * 0.85}
          stroke="rgba(251,113,133,0.4)"
          strokeDasharray="2 4"
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#a5b4fc"
          strokeWidth={2}
          dot={{ r: 3, fill: "#a5b4fc", stroke: "#0a0a0b", strokeWidth: 1 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
