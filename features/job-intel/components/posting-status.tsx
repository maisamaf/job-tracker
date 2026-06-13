"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IngestForm } from "./ingest-form";
import { PostingDetail } from "./posting-detail";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { JobPosting } from "@/lib/db/schema";

interface PostingStatusProps {
  applicationId: string;
  initialJobUrl?: string | null;
  initialDescription?: string | null;
  isTabActive?: boolean;
}

export function PostingStatus({ applicationId, initialJobUrl, initialDescription, isTabActive = true }: PostingStatusProps) {
  const queryClient = useQueryClient();

  const { data: posting, isLoading, error } = useQuery<JobPosting | null>({
    queryKey: ["job-posting", applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/postings/${applicationId}`);
      if (!res.ok) throw new Error("Failed to fetch posting");
      return res.json();
    },
    enabled: isTabActive,
    refetchInterval: (query) => {
      const data = query.state.data as JobPosting | null;
      return isTabActive && (data?.status === "processing" || data?.status === "pending") ? 2000 : false;
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async (input: { url?: string; fallbackText?: string }) => {
      const res = await fetch("/api/postings/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, ...input }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to ingest");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-posting", applicationId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 border rounded-lg bg-muted/10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking job details status...</p>
      </div>
    );
  }

  // If no posting, or it failed
  if (!posting || posting.status === "failed") {
    return (
      <div className="space-y-6">
        {posting?.status === "failed" && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
            <strong>Error analyzing job details:</strong> {posting.errorMessage || "Failed to parse job details."}
          </div>
        )}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Extract Job Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Provide a job listing URL or paste the job description text. We will scrape and analyze it to extract key requirements, skills, tech stack, and generate custom matching analyses.
            </p>
          </div>
          <IngestForm
            initialUrl={initialJobUrl || ""}
            initialText={initialDescription || ""}
            onSubmit={(url, text) => ingestMutation.mutate({ url, fallbackText: text })}
            isLoading={ingestMutation.isPending}
          />
        </div>
      </div>
    );
  }

  if (posting.status === "processing" || posting.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 border rounded-lg bg-muted/10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Scraping & analyzing job posting...</p>
        <p className="text-xs text-muted-foreground">This takes a few seconds. We&apos;re extracting skills, stacked tech, and responsibilities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Job Intelligence</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            ingestMutation.mutate({
              url: initialJobUrl || undefined,
              fallbackText: posting.rawText || initialDescription || undefined,
            })
          }
          disabled={ingestMutation.isPending}
        >
          {ingestMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Re-analyzing...
            </>
          ) : (
            "Re-analyze Posting"
          )}
        </Button>
      </div>
      <PostingDetail posting={posting} />
    </div>
  );
}