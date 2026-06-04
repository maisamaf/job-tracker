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
        "group relative rounded-lg border bg-card p-3 shadow-sm",
        "transition-shadow hover:shadow-md",
        isDragging && "opacity-40 cursor-grabbing",
        isDragOverlay && "shadow-xl rotate-1 cursor-grabbing opacity-100"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Company + role */}
      <div className="flex items-start gap-2.5 pr-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-bold uppercase">
          {application.company.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <Link
            href={`/applications/${application.id}`}
            className="text-sm font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
          >
            {application.role}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {application.company}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {application.location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
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
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}