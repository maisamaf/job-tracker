"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StageTime } from "../actions/get-analytics";
import { STATUS_COLORS } from "../types";

interface StageTimingChartProps {
  data: StageTime[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StageTime }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{d.label}</p>
      <p className="text-muted-foreground">
        Avg{" "}
        <span className="text-foreground font-medium">
          {d.avgDays} {d.avgDays === 1 ? "day" : "days"}
        </span>
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {d.sampleSize} transitions
      </p>
    </div>
  );
}

export function StageTimingChart({ data }: StageTimingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        Not enough data yet — move applications through stages to see timing.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barSize={20}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--border)"
          opacity={0.5}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          unit=" d"
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={88}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
        />
        <Bar dataKey="avgDays" radius={[0, 6, 6, 0]}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
