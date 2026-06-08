import Link from "next/link";
import { ArrowRight, Clock, History } from "lucide-react";
import { STATUS_CONFIG } from "@/features/applications/types";
import type { ApplicationStatus } from "@/features/applications/types";
import type { ActivityEntry } from "../actions/get-activity";
import { ActivityFilterTabs } from "./activity-filter-tabs";
import { ActivityStats } from "./activity-stats";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

interface ActivityLogViewProps {
  entries: ActivityEntry[];
}

function groupByDay(entries: ActivityEntry[]): [string, ActivityEntry[]][] {
  const map = new Map<string, ActivityEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.updatedAt);
    let key: string;
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else key = format(date, "EEEE, MMM d");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return Array.from(map.entries());
}

function StatusChip({ value }: { value: string }) {
  const config = STATUS_CONFIG[value as ApplicationStatus];
  if (!config) return <span className="font-medium text-xs">{value}</span>;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const isStatusChange = entry.fieldChanged === "status";
  return (
    <div className="flex items-start gap-4 py-3 group">
      <div className="relative flex flex-col items-center shrink-0 mt-1.5">
        <div className="size-2 rounded-full bg-border ring-2 ring-background group-hover:bg-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/applications/${entry.applicationId}`}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {entry.role}{" "}
          <span className="font-normal text-muted-foreground">
            at {entry.company}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {isStatusChange ? (
            <>
              <span className="text-xs text-muted-foreground">Status</span>
              {entry.oldValue && (
                <>
                  <StatusChip value={entry.oldValue} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </>
              )}
              {entry.newValue && <StatusChip value={entry.newValue} />}
            </>
          ) : (
            <span className="text-xs text-muted-foreground capitalize">
              {entry.fieldChanged} updated
              {entry.newValue && (
                <span className="text-foreground"> → {entry.newValue}</span>
              )}
            </span>
          )}
        </div>
      </div>
      <time
        className="shrink-0 text-xs text-muted-foreground tabular-nums whitespace-nowrap"
        dateTime={new Date(entry.updatedAt).toISOString()}
        title={format(new Date(entry.updatedAt), "PPpp")}
      >
        {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
      </time>
    </div>
  );
}

export function ActivityLogView({ entries }: ActivityLogViewProps) {
  const grouped = groupByDay(entries);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {entries.length} {entries.length === 1 ? "event" : "events"} in this
            period
          </p>
        </div>
        <ActivityFilterTabs />
      </div>

      <ActivityStats entries={entries} />

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <History className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            No activity in this period
          </h3>
          <p className="text-sm text-muted-foreground">
            Try a wider time range or update an application status.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {grouped.map(([day, dayEntries]) => (
            <div key={day} className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {day}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="relative ml-2 pl-6 border-l border-border">
                {dayEntries.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
