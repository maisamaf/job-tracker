"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GapSkeleton } from "./gap-skeleton";
import { MatchAnalysisCard } from "./match-analysis-card";
import { RoleIntelCard } from "./role-intel-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import type { GapAnalysis, JobPosting } from "@/lib/db/schema";
import Link from "next/link";

interface GapAnalysisViewProps {
  applicationId: string;
  isTabActive?: boolean;
  initialDescription?: string | null;
  initialJobUrl?: string | null;
}

export function GapAnalysisView({
  applicationId,
  isTabActive = true,
  initialDescription,
  initialJobUrl,
}: GapAnalysisViewProps) {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading, error } = useQuery<GapAnalysis | null>({
    queryKey: ["gap-analysis", applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/gap-analysis/${applicationId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch gap analysis");
      }
      return res.json();
    },
    enabled: isTabActive,
    refetchOnWindowFocus: false,
    retry: false,
    // Poll every 4 s while there's no result yet (background ingest+analysis in progress)
    // Stop polling immediately if an error is encountered (e.g., profile required or scraping failed)
    refetchInterval: (query) => (query.state.error || query.state.data ? false : 4000),
  });

  // Whenever analysis data arrives (including auto-ingested cases), refresh the posting
  // so Role Intel always has accurate data without a manual page refresh.
  const { data: posting } = useQuery<JobPosting | null>({
    queryKey: ["job-posting", applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/postings/${applicationId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isTabActive,
    // Re-fetch when analysis data arrives so we pick up auto-ingested postings
    staleTime: analysis ? 0 : 30_000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Analysis failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gap-analysis", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["job-posting", applicationId] });
    },
  });

  if (isLoading || analyzeMutation.isPending) {
    return <GapSkeleton />;
  }

  const isProfileError =
    error?.message?.includes("profile") ||
    (analyzeMutation.error as Error)?.message?.includes("profile");

  if (isProfileError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4">
        <AlertCircle className="size-10 text-amber-500" />
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-semibold">Profile Required</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To run a Gap Analysis, we need your CV details. Please go to your Settings, upload your CV
            or add your skills and experience first!
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

  if (error || analyzeMutation.error) {
    const errMsg = error?.message || analyzeMutation.error?.message || "An error occurred";
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center space-y-4">
        <AlertCircle className="size-10 text-red-500 mx-auto" />
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Analysis Error</h3>
          <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto leading-relaxed">
            {errMsg.includes("posting") || errMsg.includes("scrape")
              ? "The job details have not been analyzed yet. Please make sure the job description or URL is scraped first."
              : errMsg}
          </p>
        </div>
        <Button size="sm" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}>
          {analyzeMutation.isPending ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    );
  }

  if (!analysis) {
    const hasJobData = initialDescription || initialJobUrl;

    if (hasJobData) {
      // Background ingest+analysis is in progress — show skeleton instead of error
      return <GapSkeleton />;
    }

    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-4 flex flex-col items-center justify-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-base font-semibold">No Job Details</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please edit this application to add a job description or URL. We need job details to run the Candidate-Job Fit Analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatchAnalysisCard
        analysis={analysis}
        onRerun={() => analyzeMutation.mutate()}
        isRerunning={analyzeMutation.isPending}
      />
      {posting && posting.status === "ready" && <RoleIntelCard posting={posting} />}
    </div>
  );
}
