import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter row */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 flex gap-8 border-b">
          {["w-32", "w-48", "w-24", "w-20", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3.5 flex items-center gap-8 border-b last:border-0"
          >
            <div className="flex items-center gap-2 w-32">
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-20 ml-auto hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
