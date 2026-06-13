import type { ApplicationStatus } from "../types";
import type { ApplicationDetail } from "../actions/get-application";
import { format } from "date-fns";

interface ApplicationTimelineProps {
  application: ApplicationDetail;
}

const TIMELINE_STAGES: ApplicationStatus[] = [
  "bookmarked",
  "applying",
  "applied",
  "interviewing",
  "offered",
];

const STAGE_LABELS: Record<ApplicationStatus, string> = {
  bookmarked: "Bookmarked",
  applying: "Applying",
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered / closed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STAGE_HINTS: Partial<Record<ApplicationStatus, string>> = {
  applying: "Drafting cover letter",
  applied: "Awaiting response",
  interviewing: "Interview scheduled",
  offered: "Offer received",
};

function StageIcon({
  status,
  isCurrent,
  isDone,
}: {
  status: ApplicationStatus;
  isCurrent: boolean;
  isDone: boolean;
}) {
  if (isDone) {
    const color =
      status === "bookmarked"
        ? "bg-emerald-500 border-emerald-500"
        : "bg-primary border-primary";
    return (
      <span
        className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${color}`}
      >
        <span className="size-2 rounded-sm bg-white" />
      </span>
    );
  }
  if (isCurrent) {
    return (
      <span className="size-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center shrink-0">
        <span className="size-2 rounded-full bg-white" />
      </span>
    );
  }
  // Future
  return (
    <span className="size-5 rounded-full border-2 border-border bg-background shrink-0" />
  );
}

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const currentStatus = application.status as ApplicationStatus;

  const isTerminal =
    currentStatus === "rejected" || currentStatus === "withdrawn";

  const currentStageIndex = TIMELINE_STAGES.indexOf(
    isTerminal ? "offered" : currentStatus
  );

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4 gap-2">
        <span className="w-4 h-4 rounded border border-border inline-block" />
        <h3 className="text-base font-semibold text-foreground">
          Application timeline
        </h3>
      </div>

      {/* Timeline steps */}
      <div className="px-5 pb-5">
        <ol className="flex flex-col">
          {TIMELINE_STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIndex || (isTerminal && idx <= currentStageIndex);
            const isCurrent = !isTerminal && stage === currentStatus;
            const isFuture = !isDone && !isCurrent;
            const isLast = idx === TIMELINE_STAGES.length - 1;

            return (
              <li key={stage} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <StageIcon
                    status={stage}
                    isCurrent={isCurrent}
                    isDone={isDone}
                  />
                  {(!isLast || isTerminal) && (
                    <span
                      className={`w-px flex-1 my-1 ${isDone ? "bg-border" : "bg-border/50"
                        }`}
                      style={{ minHeight: 20 }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pb-4 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${isCurrent
                        ? "text-foreground"
                        : isFuture
                          ? "text-muted-foreground"
                          : "text-foreground"
                        }`}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-primary font-medium">
                        — now
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isCurrent && STAGE_HINTS[stage]
                      ? STAGE_HINTS[stage]
                      : isDone
                        ? stage === "bookmarked" && application.createdAt
                          ? format(new Date(application.createdAt), "d MMM yyyy")
                          : stage === "applied" && application.appliedAt
                            ? format(new Date(application.appliedAt), "d MMM yyyy")
                            : null
                        : "—"}
                  </p>
                </div>
              </li>
            );
          })}

          {/* Terminal stage (rejected / withdrawn) */}
          {isTerminal && (
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-5 h-5 rounded-full border-2 border-red-400 bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                </span>
              </div>
              <div className="pb-4 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {STAGE_LABELS[currentStatus]}
                  </span>
                  <span className="text-xs text-red-500 font-medium">— now</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">—</p>
              </div>
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
