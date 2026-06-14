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
      <div className="flex items-center justify-between mb-3 px-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              config.className,
            )}
          >
            {config.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground/80 tabular-nums bg-muted/65 px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-2xl p-2 min-h-[200px] border border-transparent transition-all duration-200",
          isOver ? "bg-primary/3 border-primary/15 shadow-inner" : "bg-muted/30",
        )}
      >
        {applications.map((app) => (
          <KanbanCard key={app.id} application={app} />
        ))}

        {applications.length === 0 && (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl border-2 border-dashed",
              "text-xs text-muted-foreground/60 py-8 transition-all duration-200",
              isOver ? "border-primary/40 text-primary bg-primary/[0.01]" : "border-muted/30 bg-transparent",
            )}
          >
            {isOver ? "Drop here" : "No applications"}
          </div>
        )}
      </div>
    </div>
  );
}
