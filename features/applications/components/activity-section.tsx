import type { ActivityLog } from "@/lib/db"
import { STATUS_CONFIG } from "../types"
import type { ApplicationStatus } from "../types"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Clock } from "lucide-react"

interface ActivitySectionProps {
    log: ActivityLog[]
}

function ActivityEntry({ entry }: { entry: ActivityLog }) {
    const isStatusChange = entry.fieldChanged === "status"

    return (
        <div className="flex items-start gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center mt-1 shrink-0">
                <div className="h-2 w-2 rounded-full bg-gray-300 ring-2 ring-background" />
            </div>

            <div className="flex-1 min-w-0 pb-4">
                {isStatusChange ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Status changed</span>
                        {entry.oldValue && (
                            <>
                                <span
                                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[entry.oldValue as ApplicationStatus]?.className ?? ""
                                        }`}
                                >
                                    {STATUS_CONFIG[entry.oldValue as ApplicationStatus]?.label ??
                                        entry.oldValue}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            </>
                        )}
                        {entry.newValue && (
                            <span
                                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[entry.newValue as ApplicationStatus]?.className ?? ""
                                    }`}
                            >
                                {STATUS_CONFIG[entry.newValue as ApplicationStatus]?.label ??
                                    entry.newValue}
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        <span className="capitalize">{entry.fieldChanged}</span> updated
                        {entry.newValue && (
                            <span className="text-foreground"> → {entry.newValue}</span>
                        )}
                    </p>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                </span>
            </div>
        </div>
    )
}

export function ActivitySection({ log }: ActivitySectionProps) {
    return (
        <section>
            <h2 className="text-sm font-semibold mb-3">Activity</h2>

            {log.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                    No activity yet — changes to this application will appear here.
                </p>
            ) : (
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[3px] top-2 bottom-0 w-px bg-gray-300" />
                    <div className="flex flex-col">
                        {log.map((entry) => (
                            <ActivityEntry key={entry.id} entry={entry} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}