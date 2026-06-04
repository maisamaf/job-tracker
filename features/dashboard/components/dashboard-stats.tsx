import { Briefcase, TrendingUp, Clock, CalendarCheck } from "lucide-react";
import type { DashboardStats } from "../actions/get-dashboard-data";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      label: "Total applications",
      value: stats.total,
      icon: Briefcase,
      sub: "all time",
    },
    {
      label: "Active pipeline",
      value: stats.active,
      icon: TrendingUp,
      sub: "not closed",
    },
    {
      label: "Awaiting response",
      value: stats.awaitingResponse,
      icon: Clock,
      sub: "applied",
    },
    {
      label: "Interviewing",
      value: stats.interviewing,
      icon: CalendarCheck,
      sub: "in progress",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border bg-card px-5 py-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {item.label}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
