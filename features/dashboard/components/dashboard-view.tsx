import { getHours } from "date-fns";
import { DashboardStats } from "./dashboard-stats";
import { RecentApplications } from "./recent-applications";
import { QuickActions } from "./quick-actions";
import { PipelineNudge } from "./pipeline-nudge";
import type { DashboardData } from "../actions/get-dashboard-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DashboardViewProps {
  data: DashboardData;
}

function getGreeting(name: string | null): string {
  const hour = getHours(new Date());
  const firstName = name?.split(" ")[0] ?? null;
  const suffix = firstName ? `, ${firstName}` : "";

  if (hour < 12) return `Good morning${suffix}`;
  if (hour < 17) return `Good afternoon${suffix}`;
  return `Good evening${suffix}`;
}

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Greeting + quick actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {getGreeting(data.userName)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.stats.total === 0
              ? "Start your job search by adding your first application."
              : `You have ${data.stats.active} active ${
                  data.stats.active === 1 ? "application" : "applications"
                } in your pipeline.`}
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Stats */}
      <DashboardStats stats={data.stats} />

      {/* Pipeline nudge */}
      <PipelineNudge stats={data.stats} />

      {/* Recent activity */}
      <div>
        <RecentApplications applications={data.recentApplications} />
      </div>

      {/* Analytics — only shown when there's data */}
      {data.stats.total >= 3 && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-5 py-4">
          <div>
            <p className="text-sm font-medium">
              See how your search is performing
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Response rates, stage timing, and conversion funnel.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 shrink-0"
          >
            <Link href="/analytics">
              View analytics
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
