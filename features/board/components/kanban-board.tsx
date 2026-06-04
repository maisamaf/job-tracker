"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updateStatus } from "../../applications/actions/update-status";
import { STATUS_OPTIONS, type ApplicationStatus } from "../../applications/types";
import type { BoardData } from "../actions/get-board-applications";
import type { Application } from "@/lib/db";

// Active statuses
const PIPELINE_STATUSES: ApplicationStatus[] = [
  "bookmarked",
  "applying",
  "applied",
  "interviewing",
  "offered",
];
const CLOSED_STATUSES: ApplicationStatus[] = ["rejected", "withdrawn"];

interface KanbanBoardProps {
  initialData: BoardData;
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardData>(initialData);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [overColumn, setOverColumn] = useState<ApplicationStatus | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts — prevents accidental drags
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const app =
      Object.values(board)
        .flat()
        .find((a) => a.id === id) ?? null;
    setActiveApp(app);
  }

  function handleDragOver(event: DragEndEvent) {
    const over = event.over?.id as ApplicationStatus | null;
    setOverColumn(over);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveApp(null);
    setOverColumn(null);

    if (!over || !activeApp) return;

    const fromStatus = activeApp.status as ApplicationStatus;
    const toStatus = over.id as ApplicationStatus;

    if (fromStatus === toStatus) return;

    // Optimistic update — move the card immediately
    setBoard((prev) => {
      const next = { ...prev };
      next[fromStatus] = next[fromStatus].filter((a) => a.id !== activeApp.id);
      next[toStatus] = [...next[toStatus], { ...activeApp, status: toStatus }];
      return next;
    });

    // Persist to DB in background
    startTransition(async () => {
      const formData = new FormData();
      formData.set("status", toStatus);
      const result = await updateStatus(activeApp.id, {}, formData);

      // Revert on failure
      if (result?.errors) {
        setBoard((prev) => {
          const next = { ...prev };
          next[toStatus] = next[toStatus].filter((a) => a.id !== activeApp.id);
          next[fromStatus] = [...next[fromStatus], activeApp];
          return next;
        });
      }
    });
  }

  const visibleStatuses = showClosed ? STATUS_OPTIONS : PIPELINE_STATUSES;

  const closedCount = CLOSED_STATUSES.reduce(
    (sum, s) => sum + board[s].length,
    0,
  );

  const totalActive = PIPELINE_STATUSES.reduce(
    (sum, s) => sum + board[s].length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalActive} active{" "}
            {totalActive === 1 ? "application" : "applications"}
          </p>
        </div>
        {closedCount > 0 && (
          <button
            onClick={() => setShowClosed((v) => !v)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showClosed ? "Hide closed" : `Show closed (${closedCount})`}
          </button>
        )}
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {visibleStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={board[status]}
              isOver={overColumn === status}
            />
          ))}
        </div>

        {/* Ghost card shown while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeApp ? (
            <KanbanCard application={activeApp} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
