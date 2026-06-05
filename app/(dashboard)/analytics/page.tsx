import type { Metadata } from "next";
import { getAnalytics } from "@/features/analytics/actions/get-analytics";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";

export const metadata: Metadata = { title: "Analytics — JobTrackr" };

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return <AnalyticsDashboard data={data} />;
}
