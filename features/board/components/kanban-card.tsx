"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import type { Application } from "@/lib/db"
import { MapPin, ExternalLink, GripVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn, formatSalary } from "@/lib/utils"


interface KanbanCardProps {
  application: Application
  isDragOverlay?: boolean
}

export function KanbanCard({ application, isDragOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { status: application.status },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const salary = formatSalary(application.salaryMin, application.salaryMax)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border/40 bg-card p-3.5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20",
        isDragging && "opacity-40 cursor-grabbing",
        isDragOverlay && "shadow-xl rotate-1 cursor-grabbing opacity-100"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2.5 cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4 text-muted-foreground/60 hover:text-muted-foreground" />
      </div>

      {/* Company + role */}
      <div className="flex items-start gap-3 pr-5">
        <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {application.company.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <Link
            href={`/applications/${application.id}`}
            className="text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {application.role}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
            {application.company}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {application.location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {application.location}
          </span>
        )}
        {salary && (
          <span className="text-[11px] text-muted-foreground">{salary}</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
        </span>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-0.5"
          >
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  )
}