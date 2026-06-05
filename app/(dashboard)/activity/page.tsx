import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getActivity,
  type ActivityFilter,
} from "@/features/activity/actions/get-activity";
import { ActivityLogView } from "@/features/activity/components/activity-log-view";

export const metadata: Metadata = { title: "Activity — JobTrackr" };

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ActivityPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const entries = await getActivity((filter as ActivityFilter) ?? "30d");

  return (
    <Suspense>
      <ActivityLogView entries={entries} />
    </Suspense>
  );
}
