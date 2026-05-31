import { Briefcase, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <SearchX className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No applications match your current filters. Try adjusting your search
          or selecting a different status.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
        <Briefcase className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No applications yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Add your first job application to start tracking your search.
      </p>
      <Button asChild>
        <Link href="/applications/new">Add application</Link>
      </Button>
    </div>
  );
}
