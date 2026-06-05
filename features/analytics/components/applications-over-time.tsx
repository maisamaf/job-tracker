"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyCount } from "../actions/get-analytics";

interface ApplicationsOverTimeProps {
  data: WeeklyCount[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        <span className="text-foreground font-medium">{payload[0].value}</span>{" "}
        {payload[0].value === 1 ? "application" : "applications"}
      </p>
    </div>
  );
}

export function ApplicationsOverTime({ data }: ApplicationsOverTimeProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
        No applications added in the last 12 weeks.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
          opacity={0.5}
        />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#818cf8"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#818cf8" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
