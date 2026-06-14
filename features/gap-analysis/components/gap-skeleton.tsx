"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function GapSkeleton() {
  return (
    <div className="space-y-8">
      {/* Radial chart skeleton */}
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6 p-6 border rounded-lg bg-card">
        <div className="w-28 h-28 rounded-full border-8 border-muted flex items-center justify-center">
          <Skeleton className="w-10 h-5" />
        </div>
        <div className="w-28 h-28 rounded-full border-8 border-muted flex items-center justify-center">
          <Skeleton className="w-10 h-5" />
        </div>
        <div className="w-28 h-28 rounded-full border-8 border-muted flex items-center justify-center">
          <Skeleton className="w-10 h-5" />
        </div>
      </div>

      {/* 3 columns skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="w-24 h-5" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="w-14 h-5 rounded-full" />
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-12 h-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations skeleton */}
      <div className="space-y-3">
        <Skeleton className="w-32 h-5" />
        <div className="space-y-2 border rounded-lg p-4 bg-card">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
      </div>
    </div>
  );
}
