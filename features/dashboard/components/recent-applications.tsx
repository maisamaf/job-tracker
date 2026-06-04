import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Briefcase } from "lucide-react";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { Button } from "@/components/ui/button";
import type { Application } from "@/lib/db";

interface RecentApplicationsProps {
  applications: Application[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 py-12 text-center">
        <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No applications yet
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Start tracking your job search by adding your first application.
        </p>
        <Button asChild size="sm">
          <Link href="/applications/new">Add application</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
        <h2 className="text-sm font-semibold">Recent applications</h2>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
          <Link href="/applications">
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="divide-y">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
          >
            {/* Company avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase border">
              {app.company.slice(0, 2)}
            </div>

            {/* Role + company */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {app.role}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {app.company}
                {app.location && ` · ${app.location}`}
              </p>
            </div>

            {/* Status + time */}
            <div className="flex flex-col items-start gap-1">
              <StatusBadge status={app.status} className="ml-auto" />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(app.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
