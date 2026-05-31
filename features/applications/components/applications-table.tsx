import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "./status-badge"
import type { Application } from "@/lib/db"
import { formatSalary } from "@/lib/utils"
import { ExternalLink, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ApplicationsTableProps {
  applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[240px] font-medium">Company</TableHead>
            <TableHead className="font-medium">Role</TableHead>
            <TableHead className="font-medium hidden lg:table-cell">Location</TableHead>
            <TableHead className="font-medium hidden md:table-cell">Salary</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium hidden sm:table-cell text-right">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow
              key={app.id}
              className="group cursor-pointer"
            >
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}