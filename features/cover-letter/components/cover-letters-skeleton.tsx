import { Skeleton } from "@/components/ui/skeleton";

export function CoverLettersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Letter cards */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border px-4 py-3 flex items-start gap-3"
          >
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-20 shrink-0 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
