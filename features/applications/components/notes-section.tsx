"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateNotes } from "../actions/update-notes";
import { Loader2, Pencil, Check, X } from "lucide-react";
import type { ActionState } from "../schemas";

interface NotesSectionProps {
  applicationId: string;
  initialNotes: string | null;
}

const INITIAL_STATE: ActionState = {};

export function NotesSection({
  applicationId,
  initialNotes,
}: NotesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialNotes ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prevSuccess, setPrevSuccess] = useState(false);

  const boundAction = updateNotes.bind(null, applicationId);
  const [state, action, isPending] = useActionState(boundAction, INITIAL_STATE);

  if (state.success && !prevSuccess) {
    setPrevSuccess(true);
    setIsEditing(false);
  } else if (!state.success && prevSuccess) {
    setPrevSuccess(false);
  }
  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 gap-1.5 text-xs text-muted-foreground"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <form action={action}>
          <Textarea
            ref={textareaRef}
            name="notes"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add notes about this role — referrals, interview prep, impressions..."
            className="min-h-[120px] resize-y mb-2"
            disabled={isPending}
          />
          {state.errors?.notes && (
            <p className="text-xs text-destructive mb-2">
              {state.errors.notes[0]}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setValue(initialNotes ?? "");
                setIsEditing(false);
              }}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[80px] rounded-lg border bg-muted/30 px-4 py-3 text-sm cursor-text hover:bg-muted/50 transition-colors"
        >
          {value ? (
            <p className="whitespace-pre-wrap text-foreground">{value}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Click to add notes...
            </p>
          )}
        </div>
      )}
    </section>
  );
}
