"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./status-badge";
import { updateStatus } from "../actions/update-status";
import { STATUS_OPTIONS } from "../types";
import type { ApplicationDetail } from "../actions/get-application";
import { formatSalary } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ApplicationHeaderProps {
  application: ApplicationDetail;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleStatusChange(value: string) {
    const formData = new FormData();
    formData.set("status", value);
    startTransition(async () => {
      await updateStatus(application.id, {}, formData);
      router.refresh();
    });
  }

  const salary = formatSalary(application.salaryMin, application.salaryMax);

  return (
    <div className="mb-8">
      {/* Back link */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All applications
      </Link>

      {/* Main header card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left — company + role */}
          <div className="flex items-start gap-4">
            <p className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted border text-lg font-bold uppercase">
              {application.company.slice(0, 2)}
            </p>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                {application.role}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="font-medium">{application.company}</span>
                {application.jobUrl && (
                  <Link
                    href={application.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    Job posting
                  </Link>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {application.location && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {application.location}
                  </p>
                )}
                {salary && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />
                    {salary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right — status selector */}
          <div className="space-y-2">
            <Select
              value={application.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Added{" "}
              {formatDistanceToNow(new Date(application.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
