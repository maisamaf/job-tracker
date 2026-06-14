import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card p-5 flex flex-col gap-3.5 transition-all duration-200 hover:border-primary/25 hover:shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {sub && <p className="text-xs font-medium text-muted-foreground/85 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
