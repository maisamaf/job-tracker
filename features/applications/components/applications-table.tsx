"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { BulkDeleteDialog } from "@/components/shared/bulk-delete-dialog"
import { useBulkSelection } from "@/hooks/use-bulk-selection"
import { StatusBadge } from "./status-badge"
import { TrashIcon } from "./trash-icon"
import { deleteApplications } from "../actions/delete-applications"
import type { Application } from "@/lib/db"
import { formatSalary } from "@/lib/utils"
import { ExternalLink, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ApplicationsTableProps {
  applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const {
    selected,
    setSelected,
    allSelected,
    someSelected,
    pendingDelete,
    setPendingDelete,
    isPending,
    toggleAll,
    toggleOne,
    confirmDelete,
  } = useBulkSelection(applications, deleteApplications)

  const deleteCount = pendingDelete?.length ?? 0

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => setPendingDelete(Array.from(selected))}
            >
              <TrashIcon size={14} />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Select all applications"
                />
              </TableHead>
              <TableHead className="w-[240px] font-medium">Company</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium hidden lg:table-cell">Location</TableHead>
              <TableHead className="font-medium hidden md:table-cell">Salary</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium hidden sm:table-cell text-right">Added</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow
                key={app.id}
                className="group"
                data-state={selected.has(app.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(app.id)}
                    onCheckedChange={(checked) =>
                      toggleOne(app.id, checked === true)
                    }
                    aria-label={`Select ${app.company}`}
                  />
                </TableCell>

                <TableCell className="font-medium">
                  <Link
                    href={`/applications/${app.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {/* Company initial avatar */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase border">
                      {app.company.slice(0, 2)}
                    </span>
                    <span className="truncate max-w-[160px]">{app.company}</span>
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/applications/${app.id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <span className="truncate block max-w-[220px]">{app.role}</span>
                    </Link>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Job posting
                      </a>
                    )}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {app.location ? (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {app.location}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {formatSalary(app.salaryMin, app.salaryMax)}
                </TableCell>

                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>

                <TableCell className="hidden sm:table-cell text-right text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(app.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                    disabled={isPending}
                    onClick={() => setPendingDelete([app.id])}
                  >
                    <TrashIcon size={16} />
                    <span className="sr-only">Delete application</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BulkDeleteDialog
        open={pendingDelete !== null}
        count={deleteCount}
        itemLabel="application"
        itemLabelPlural="applications"
        isPending={isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        description={
          <>
            This will permanently remove{" "}
            {deleteCount > 1 ? "these applications" : "this application"},
            along with any related contacts, interviews, and notes. This
            action cannot be undone.
          </>
        }
      />
    </div>
  )
}
