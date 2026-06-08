import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDashboardData } from "@/features/dashboard/actions/get-dashboard-data";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard — JobTrackr" };

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) redirect("/login");

  return <DashboardView data={data} />;
}
