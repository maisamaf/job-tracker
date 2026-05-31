"use client"

import { useActionState, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormField } from "./form-field"
import { createInterview } from "../actions/create-interview"
import type { ActionState } from "../schemas"
import type { Interview } from "@/lib/db"
import { Plus, CalendarDays, Loader2 } from "lucide-react"
import { format } from "date-fns"

const INTERVIEW_TYPES = [
  { value: "phone_screen", label: "Phone screen" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioural" },
  { value: "onsite", label: "Onsite" },
  { value: "final", label: "Final round" },
] as const

const OUTCOME_OPTIONS = [
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
]

interface InterviewsSectionProps {
  applicationId: string
  interviews: Interview[]
}

const INITIAL_STATE: ActionState = {}

function AddInterviewDialog({ applicationId }: { applicationId: string }) {
   const [open, setOpen] = useState(false);
   const [prevSuccess, setPrevSuccess] = useState(false);
   const boundAction = createInterview.bind(null, applicationId);
   const [state, action, isPending] = useActionState(
     boundAction,
     INITIAL_STATE,
   );

   if (state.success && !prevSuccess) {
     setPrevSuccess(true);
     setOpen(false);
   } else if (!state.success && prevSuccess) {
     setPrevSuccess(false);
   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Plus className="h-3 w-3" />
          Log interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log interview</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-2">
          {state.errors?.root && (
            <p className="text-xs text-destructive">{state.errors.root[0]}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="type"
              label="Type"
              required
              error={state.errors?.type}
            >
              <Select name="type" defaultValue="phone_screen">
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              id="scheduledAt"
              label="Date"
              error={state.errors?.scheduledAt}
            >
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                disabled={isPending}
              />
            </FormField>
          </div>
          <FormField id="outcome" label="Outcome" error={state.errors?.outcome}>
            <Select name="outcome" defaultValue="pending">
              <SelectTrigger id="outcome">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="notes" label="Notes" error={state.errors?.notes}>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Topics covered, questions asked, impressions..."
              className="resize-none min-h-[100px]"
              disabled={isPending}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const OUTCOME_STYLES: Record<string, string> = {
  passed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-red-600 dark:text-red-400",
  pending: "text-amber-600 dark:text-amber-400",
  cancelled: "text-muted-foreground",
}

export function InterviewsSection({
  applicationId,
  interviews,
}: InterviewsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">
          Interviews
          {interviews.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({interviews.length})
            </span>
          )}
        </h2>
        <AddInterviewDialog applicationId={applicationId} />
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
          <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No interviews logged yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {interviews.map((interview) => {
            const typeLabel =
              INTERVIEW_TYPES.find((t) => t.value === interview.type)?.label ??
              interview.type
            return (
              <div
                key={interview.id}
                className="rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">{typeLabel}</span>
                    {interview.scheduledAt && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {format(
                          new Date(interview.scheduledAt),
                          "MMM d, yyyy · h:mm a"
                        )}
                      </span>
                    )}
                  </div>
                  {interview.outcome && (
                    <span
                      className={`text-xs font-medium capitalize ${OUTCOME_STYLES[interview.outcome] ?? "text-muted-foreground"
                        }`}
                    >
                      {interview.outcome}
                    </span>
                  )}
                </div>
                {interview.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {interview.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}