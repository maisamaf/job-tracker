"use client";

import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface SkillMatchChartProps {
  score: number;
  label: string;
  color?: string;
}

export function SkillMatchChart({ score, label, color = "hsl(var(--primary))" }: SkillMatchChartProps) {
  const data = [
    {
      name: label,
      value: score,
      fill: color,
    },
  ];

  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "var(--muted)", opacity: 0.15 }}
            dataKey="value"
            cornerRadius={5}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}%</span>
        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
