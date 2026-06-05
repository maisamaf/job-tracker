import type { ActivityEntry } from "../actions/get-activity";
import { STATUS_CONFIG } from "@/features/applications/types";
import type { ApplicationStatus } from "@/features/applications/types";

interface ActivityStatsProps {
  entries: ActivityEntry[];
}

export function ActivityStats({ entries }: ActivityStatsProps) {
  const statusChanges = entries.filter((e) => e.fieldChanged === "status");

  // Count UNIQUE applications that moved into each status
  // Using a Set per status deduplicates repeated transitions on the same app
  const uniqueAppsIntoStatus = new Map<string, Set<string>>();

  for (const entry of statusChanges) {
    if (!entry.newValue) continue;
    if (!uniqueAppsIntoStatus.has(entry.newValue)) {
      uniqueAppsIntoStatus.set(entry.newValue, new Set());
    }
    uniqueAppsIntoStatus.get(entry.newValue)!.add(entry.applicationId!);
  }

  const topStatuses = [...uniqueAppsIntoStatus.entries()]
    .map(([status, apps]) => ({ status, count: apps.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  if (topStatuses.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      {topStatuses.map(({ status, count }) => {
        const config = STATUS_CONFIG[status as ApplicationStatus];
        if (!config) return null;
        return (
          <div key={status} className="rounded-lg border bg-card px-4 py-3">
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <span
              className={`mt-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${config.className}`}
            >
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
