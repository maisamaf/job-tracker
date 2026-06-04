import Link from "next/link";
import type { DashboardStats } from "../actions/get-dashboard-data";
import { Lightbulb } from "lucide-react";

interface PipelineNudgeProps {
  stats: DashboardStats;
}

function getNudge(stats: DashboardStats): string | null {
  if (stats.total === 0) return null;

  if (stats.interviewing > 0) {
    return `You have ${stats.interviewing} active ${stats.interviewing === 1 ? "interview" : "interviews"} — make sure your prep notes are up to date.`;
  }

  if (stats.awaitingResponse > 3) {
    return `${stats.awaitingResponse} applications are waiting for a response. Consider following up on any that are over a week old.`;
  }

  if (stats.active === 0) {
    return "Your active pipeline is empty. Time to add new applications or revisit saved ones.";
  }

  if (stats.total > 0 && stats.active === stats.total) {
    return "All your applications are still active. Keep the pipeline moving.";
  }

  return null;
}

export function PipelineNudge({ stats }: PipelineNudgeProps) {
  const nudge = getNudge(stats);
  if (!nudge) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 px-4 py-3.5">
      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">{nudge}</p>
    </div>
  );
}
