"use client"

import { useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, MapPin, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "./status-badge"
import { updateStatus } from "../actions/update-status"
import { STATUS_OPTIONS } from "../types"
import type { ApplicationDetail } from "../actions/get-application"
import { formatSalary } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"

interface ApplicationHeaderProps {
    application: ApplicationDetail
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
    const [, startTransition] = useTransition()

    function handleStatusChange(value: string) {
        const formData = new FormData()
        formData.set("status", value)
        startTransition(() => {
            updateStatus(application.id, {}, formData)
        })
    }

    const salary = formatSalary(application.salaryMin, application.salaryMax)

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
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted border text-lg font-bold uppercase">
                            {application.company.slice(0, 2)}
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                {application.role}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-base text-muted-foreground font-medium">
                                    {application.company}
                                </span>
                                {application.jobUrl && (
                                    <Link
                                        href={application.jobUrl}
                                        // target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Job posting
                                    </Link>
                                )}
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                {application.location && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {application.location}
                                    </span>
                                )}
                                {salary && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <DollarSign className="h-3 w-3" />
                                        {salary}
                                    </span>
                                )}
                                {application.appliedAt && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        Applied {format(new Date(application.appliedAt), "MMM d, yyyy")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right — status selector */}
                    <div className="flex items-center gap-2 sm:shrink-0">
                        <Select
                            defaultValue={application.status}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-[160px]">
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
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/applications/${application.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                        Added {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </span>
                    <span>
                        Updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    )
}