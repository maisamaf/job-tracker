import { Suspense } from "react";
import { ApplicationsView } from "@/features/applications/components/applications-view";
import { ApplicationsSkeleton } from "@/features/applications/components/applications-skeleton";
import type { ApplicationStatus } from "@/features/applications/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications — JobTrackr",
};

interface Props {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = {
    status: (params.status as ApplicationStatus | "all") ?? "all",
    search: params.search ?? "",
    page: params.page ? Math.max(1, parseInt(params.page)) : 1,
  };

  return (
    <Suspense fallback={<ApplicationsSkeleton />}>
      <ApplicationsView filters={filters} />
    </Suspense>
  );
}
