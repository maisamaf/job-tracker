import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getApplications } from "../actions/get-applications";
import { ApplicationsFilters } from "./applications-filters";
import { ApplicationsTable } from "./applications-table";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import type { ApplicationsFilter } from "../types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ApplicationsViewProps {
  filters: ApplicationsFilter;
}

export async function ApplicationsView({ filters }: ApplicationsViewProps) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const { data, total, page, pages, limit } = await getApplications(
    session.user.id,
    filters,
  );

  const hasFilters = !!(
    filters.search ||
    (filters.status && filters.status !== "all")
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="h-4 w-4 mr-2" />
            Add application
          </Link>
        </Button>
      </div>

      {/* Filters — client component */}
      <ApplicationsFilters totalCount={total} />

      {/* Results */}
      {data.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <>
          <ApplicationsTable applications={data} />
          <Pagination page={page} pages={pages} total={total} limit={limit} />
        </>
      )}
    </div>
  );
}
