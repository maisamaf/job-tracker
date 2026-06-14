"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PrepSkeleton } from "./prep-skeleton";
import { QuestionCard } from "./question-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, HelpCircle, Square } from "lucide-react";
import type { InterviewQuestion } from "@/lib/db/schema";
import Link from "next/link";

interface InterviewPrepViewProps {
  applicationId: string;
  isTabActive?: boolean;
}

const CATEGORIES = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "role-specific", label: "Role-specific" },
  { value: "culture", label: "Culture" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

export function InterviewPrepView({
  applicationId,
  isTabActive = true,
}: InterviewPrepViewProps) {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<Category>("technical");

  const {
    data: questions = [],
    isLoading,
    error,
  } = useQuery<InterviewQuestion[]>({
    queryKey: ["interview-questions", applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/interview-prep/${applicationId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch questions");
      }
      return res.json();
    },
    enabled: isTabActive,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate questions");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-questions", applicationId],
      });
    },
  });

  if (isLoading) return <PrepSkeleton />;

  const isProfileError =
    error?.message?.includes("profile") ||
    (generateMutation.error as Error)?.message?.includes("profile");

  if (isProfileError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4">
        <AlertCircle className="size-10 text-amber-500" />
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-semibold">Profile Required</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To generate personalised interview questions, we need your CV. Please
            upload it under Settings first!
          </p>
        </div>
        <Link href="/settings" passHref legacyBehavior>
          <Button asChild size="sm">
            <a>Go to Settings</a>
          </Button>
        </Link>
      </div>
    );
  }

  if (error || generateMutation.error) {
    const errMsg =
      error?.message || generateMutation.error?.message || "An error occurred";
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
            Generation Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto leading-relaxed">
            {errMsg}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? "Retrying…" : "Try Again"}
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-6">
        <HelpCircle className="w-14 h-14 text-primary/60 mx-auto" />
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-lg font-semibold">Personalised Interview Prep</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Generate 12 tailor-made questions comparing your CV with the job
            requirements — 3 technical, 3 behavioral, 3 role-specific, and 3
            culture-fit questions with AI-suggested answers.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="px-8 shadow-sm"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            "Generate Interview Questions"
          )}
        </Button>
      </div>
    );
  }

  const countFor = (cat: Category) =>
    questions.filter((q) => q.category.toLowerCase() === cat).length;

  const filteredQuestions = questions.filter(
    (q) => q.category.toLowerCase() === activeCategory
  );

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} questions generated for this role.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="h-8 px-3 text-xs font-medium rounded-lg gap-1.5"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Regenerating…
            </>
          ) : (
            <>
              <Square className="w-3 h-3" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {/* Underline category tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1" role="tablist">
          {CATEGORIES.map((cat) => {
            const count = countFor(cat.value);
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.value)}
                className={[
                  "inline-flex items-center gap-1.5 px-1 pb-2.5 pt-0.5 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                ].join(" ")}
              >
                {cat.label}
                {count > 0 && (
                  <span
                    className={`text-xs tabular-nums ${isActive
                        ? "text-foreground/70"
                        : "text-muted-foreground/60"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <QuestionCard key={q.id} question={q} defaultOpen={idx === 0} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">
            No questions in this category.
          </p>
        )}
      </div>
    </div>
  );
}
