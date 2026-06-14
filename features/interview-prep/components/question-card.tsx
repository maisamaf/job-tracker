"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown, ChevronUp, Loader2, Square } from "lucide-react";
import type { InterviewQuestion } from "@/lib/db/schema";

interface QuestionCardProps {
  question: InterviewQuestion;
  defaultOpen?: boolean;
}

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Easy",
    headerClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  medium: {
    label: "Medium",
    headerClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  hard: {
    label: "Hard",
    headerClass: "bg-rose-50 dark:bg-rose-950/30",
    textClass: "text-rose-600 dark:text-rose-400",
  },
} as const;

export function QuestionCard({ question, defaultOpen = false }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [answer, setAnswer] = useState(question.userAnswer || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveMutation = useMutation({
    mutationFn: async (userAnswer: string) => {
      setSaveStatus("saving");
      const res = await fetch(`/api/interview-prep/${question.applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, userAnswer }),
      });
      if (!res.ok) throw new Error("Failed to save answer");
      return res.json();
    },
    onSuccess: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => setSaveStatus("error"),
  });

  const handleBlur = () => {
    if (answer !== (question.userAnswer || "")) {
      saveMutation.mutate(answer);
    }
  };

  const difficulty = (question.difficulty || "medium") as keyof typeof DIFFICULTY_CONFIG;
  const config = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-card overflow-hidden shadow-sm">
      {/* Difficulty header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 ${config.headerClass} cursor-pointer select-none`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className={`text-xs font-semibold ${config.textClass}`}>{config.label}</span>

        {isOpen ? (
          <ChevronUp className="size-4 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground/40" />
        )}
      </div>

      {/* Question text */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen((v) => !v)}
      >
        <p className="text-sm font-semibold text-foreground leading-snug">{question.question}</p>
      </div>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Suggested answer */}
          {question.suggestedAnswer && (
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Square className="size-3 text-emerald-600" />
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                  Suggested answer based on your profile
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {question.suggestedAnswer}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border/60 mx-4" />

          {/* User answer */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Your answer
              </span>
              <span className="text-xs text-muted-foreground/60">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> Saving…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="size-3" /> Saved
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="text-rose-500">Failed to save</span>
                )}
              </span>
            </div>
            <Textarea
              placeholder="Write your own answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={handleBlur}
              disabled={saveMutation.isPending}
              className="text-sm leading-relaxed resize-none min-h-[120px] bg-background border-border"
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}
