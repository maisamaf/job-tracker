"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/db";
import type { ApplicationStatus } from "../../applications/types";
import { STATUS_CONFIG } from "../../applications/types";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  isOver: boolean;
}

export function KanbanColumn({
  status,
  applications,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col min-w-[260px] max-w-[260px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              config.className,
            )}
          >
            {config.label}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-xl p-2 min-h-[200px] transition-colors",
          isOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/40",
        )}
      >
        {applications.map((app) => (
          <KanbanCard key={app.id} application={app} />
        ))}

        {applications.length === 0 && (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed",
              "text-xs text-muted-foreground py-8 transition-colors",
              isOver ? "border-primary/40 text-primary" : "border-transparent",
            )}
          >
            {isOver ? "Drop here" : "No applications"}
          </div>
        )}
      </div>
    </div>
  );
}
