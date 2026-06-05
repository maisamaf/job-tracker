import { Briefcase, TrendingUp, MessageSquare, Trophy } from "lucide-react";
import { StatCard } from "./stat-card";
import { StatusChart } from "./status-chart";
import { StageTimingChart } from "./stage-timing-chart";
import { ApplicationsOverTime } from "./applications-over-time";
import { FunnelChart } from "./funnel-chart";
import { EmptyAnalytics } from "./empty-analytics";
import type { AnalyticsData } from "../actions/get-analytics";

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data.hasData) return <EmptyAnalytics />;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How your job search is performing
        </p>
      </div>

      {/* Overview stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total applications"
          value={data.totalApplications}
          sub={`${data.activeApplications} active`}
          icon={Briefcase}
        />
        <StatCard
          label="Response rate"
          value={`${data.responseRate}%`}
          sub="Applied → interview"
          icon={MessageSquare}
        />
        <StatCard
          label="Offer rate"
          value={`${data.offerRate}%`}
          sub="Applied → offer"
          icon={Trophy}
        />
        <StatCard
          label="Active pipeline"
          value={data.activeApplications}
          sub="Not rejected/withdrawn"
          icon={TrendingUp}
        />
      </div>

      {/* Status distribution + Avg time per stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Applications by status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current distribution across all stages
            </p>
          </div>
          <StatusChart data={data.byStatus} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Average time per stage</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Days spent in each status before moving on
            </p>
          </div>
          <StageTimingChart data={data.avgTimePerStage} />
        </div>
      </div>

      {/* Conversion funnel + Applications over time */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Conversion funnel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              How many applications make it through each stage
            </p>
          </div>
          <FunnelChart data={data.funnel} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Applications over time</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applications added per week — last 12 weeks
            </p>
          </div>
          <ApplicationsOverTime data={data.applicationsOverTime} />
        </div>
      </div>

      {/* Insight callout — only shown when there's enough data */}
      {data.avgTimePerStage.length > 0 && (
        <div className="rounded-xl border bg-muted/30 px-5 py-4">
          <h2 className="text-sm font-semibold mb-2">Insights</h2>
          <div className="flex flex-col gap-1.5">
            {data.responseRate < 20 && (
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  Low response rate.
                </span>{" "}
                Below 20% suggests the application itself may need work — review
                your cover letters and tailor them more specifically.
              </p>
            )}
            {data.responseRate >= 20 && data.responseRate < 50 && (
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  Decent response rate.
                </span>{" "}
                Getting responses but not offers usually points to interview
                preparation as the next area to improve.
              </p>
            )}
            {(() => {
              const slowestStage = [...data.avgTimePerStage].sort(
                (a, b) => b.avgDays - a.avgDays,
              )[0];
              if (!slowestStage || slowestStage.avgDays < 7) return null;
              return (
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Longest stage: {slowestStage.label}.
                  </span>{" "}
                  Averaging {slowestStage.avgDays} days — consider following up
                  after 5–7 business days of silence.
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
