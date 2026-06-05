"use client";

import type { FunnelStage } from "../actions/get-analytics";
import { cn } from "@/lib/utils";

interface FunnelChartProps {
  data: FunnelStage[];
}

const STAGE_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
];

const STAGE_TEXT = [
  "text-indigo-600 dark:text-indigo-400",
  "text-violet-600 dark:text-violet-400",
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
];

export function FunnelChart({ data }: FunnelChartProps) {
  const max = data[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-3 py-2">
      {data.map((stage, i) => {
        const widthPct = max > 0 ? (stage.count / max) * 100 : 0;
        return (
          <div key={stage.label} className="flex items-center gap-3">
            {/* Label + count */}
            <div className="w-24 shrink-0 text-right">
              <span className="text-xs font-medium text-muted-foreground">
                {stage.label}
              </span>
            </div>

            {/* Bar */}
            <div className="flex-1 h-7 bg-muted/50 rounded-md overflow-hidden relative">
              <div
                className={cn(
                  "h-full rounded-md transition-all duration-500",
                  STAGE_COLORS[i],
                )}
                style={{
                  width: `${widthPct}%`,
                  minWidth: stage.count > 0 ? "2rem" : 0,
                }}
              >
                {stage.count > 0 && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-semibold text-white">
                    {stage.count}
                  </span>
                )}
              </div>
            </div>

            {/* Conversion rate */}
            <div className="w-12 shrink-0">
              {stage.rate !== null ? (
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    STAGE_TEXT[i],
                  )}
                >
                  {stage.rate}%
                </span>
              ) : (
                <span className="text-xs text-muted-foreground tabular-nums">
                  —
                </span>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground pl-28 mt-1">
        % = conversion from previous stage
      </p>
    </div>
  );
}
