"use client";

import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CollapsibleTextarea } from "@/components/ui/collapsible-textarea";
import { ApplicationPicker } from "./application-picker";
import { saveCoverLetter } from "../actions/save-cover-letter";
import { TONE_OPTIONS, TONE_CONFIG, type CoverLetterTone } from "../types";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  company: string;
  role: string;
  description: string | null;
}

interface CoverLetterGeneratorProps {
  applications: Application[];
  defaultApplicationId?: string;
}

export function CoverLetterGenerator({
  applications,
  defaultApplicationId,
}: CoverLetterGeneratorProps) {
  const defaultApp = defaultApplicationId && defaultApplicationId !== "none"
    ? applications.find((a) => a.id === defaultApplicationId)
    : null;

  const [selectedAppId, setSelectedAppId] = useState(defaultApplicationId ?? "none");
  const [jobDescription, setJobDescription] = useState(defaultApp?.description ?? "");
  const [background, setBackground] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [showContext, setShowContext] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const selectedApp =
    selectedAppId !== "none"
      ? applications.find((a) => a.id === selectedAppId)
      : null;

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/cover-letter",
      onError: (error) => {
        console.error("Generation error:", error);
        let errorMessage = "An error occurred during generation. Please try again.";
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch {
          if (error.message) {
            if (error.message.includes("401") || error.message.toLowerCase().includes("unauthorised")) {
              errorMessage = "Your session has expired or you are unauthorized. Please sign in again.";
            } else if (error.message.includes("429")) {
              errorMessage = "AI rate limit or token limit exceeded. Please try again in a few minutes.";
            } else {
              errorMessage = error.message;
            }
          }
        }
        setGeneratorError(errorMessage);
      },
    });

  // Auto-fill job description when app is selected
  const handleAppChange = useCallback(
    (appId: string) => {
      setSelectedAppId(appId);
      setSaved(false);
      if (appId !== "none") {
        const app = applications.find((a) => a.id === appId);
        setJobDescription(app?.description ?? "");
      }
    },
    [applications],
  );

  async function handleGenerate() {
    if (!jobDescription.trim() || !background.trim()) return;
    setSaved(false);
    setSaveError(null);
    setGeneratorError(null);
    setCompletion("");

    await complete("", {
      body: {
        jobDescription,
        background,
        tone,
        additionalContext: additionalContext || undefined,
        company: selectedApp?.company,
        role: selectedApp?.role,
      },
    });
  }

  async function handleCopy() {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!completion) return;
    setSaveError(null);

    const result = await saveCoverLetter({
      applicationId: selectedAppId !== "none" ? selectedAppId : undefined,
      content: completion,
      promptContext: JSON.stringify({
        jobDescription,
        background,
        tone,
        additionalContext,
      }),
      modelUsed: process.env.AI_MODEL,
    });

    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaved(true);
    }
  }

  const canGenerate =
    jobDescription.trim().length >= 20 && background.trim().length >= 20;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      {/* ── Left: Form ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cover letter generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below and get a tailored cover letter in
            seconds.
          </p>
        </div>

        {/* Application picker */}
        <div className="flex flex-col gap-1.5">
          <Label>Link to application</Label>
          <ApplicationPicker
            applications={applications}
            value={selectedAppId}
            onChange={handleAppChange}
          />
          <p className="text-xs text-muted-foreground">
            Selecting an app pre-fills the job description.
          </p>
        </div>

        {/* Job description */}
        <div className="flex flex-col gap-1.5">
          <CollapsibleTextarea
            id="jobDescription"
            label={
              <>
                Job description{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </>
            }
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-40 resize-y"
            disabled={isLoading}
            threshold={300}
          />
          {jobDescription.length > 0 && jobDescription.length < 20 && (
            <p className="text-xs text-destructive">At least 20 characters</p>
          )}
        </div>

        {/* Background */}
        <div className="flex flex-col gap-1.5">
          <CollapsibleTextarea
            id="background"
            label={
              <>
                Your background{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </>
            }
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Briefly describe your experience, key skills, and what makes you a strong fit. e.g. 3 years React/Next.js, built 2 SaaS products, currently doing M.Sc. CS at Passau..."
            className="min-h-30 resize-y"
            disabled={isLoading}
            threshold={300}
            collapsedHeightClass="h-[120px] max-h-[120px]"
          />
          {background.length > 0 && background.length < 20 && (
            <p className="text-xs text-destructive">At least 20 characters</p>
          )}
        </div>

        {/* Tone */}
        <div className="flex flex-col gap-1.5">
          <Label>Tone</Label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors",
                  tone === t
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-medium">
                  {TONE_CONFIG[t].label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {TONE_CONFIG[t].description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional context */}
        <div>
          <button
            type="button"
            onClick={() => setShowContext((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showContext ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Additional context
          </button>
          {showContext && (
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Anything else to mention — referral name, specific achievements, gap explanation..."
              className="mt-2 min-h-20 resize-y"
              disabled={isLoading}
            />
          )}
        </div>

        {/* Generate button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate cover letter
              </>
            )}
          </Button>
          {isLoading && (
            <Button variant="ghost" size="sm" onClick={stop}>
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* ── Right: Output ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:sticky lg:top-6">
        <div className="flex items-center justify-between min-h-7">
          <Label className="text-sm font-semibold">
            {completion ? "Generated letter" : "Output"}
          </Label>
          {completion && !isLoading && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCompletion("");
                  setSaved(false);
                }}
                className="h-7 gap-1.5 text-xs text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 gap-1.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saved}
                className="h-7 gap-1.5 text-xs"
              >
                {saved ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {generatorError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Generation failed</p>
              <p className="mt-0.5 text-xs text-destructive/90 leading-relaxed">
                {generatorError}
              </p>
            </div>
          </div>
        )}

        {/* Output area */}
        <div
          className={cn(
            "rounded-xl border bg-card min-h-125 transition-colors",
            isLoading && "border-primary/30",
          )}
        >
          {!completion && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-125 text-center px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Your cover letter will appear here
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                Fill in the job description and your background, then click
                generate.
              </p>
            </div>
          )}

          {(completion || isLoading) && (
            <div className="p-5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {completion}
                {isLoading && (
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            </div>
          )}
        </div>

        {saveError && <p className="text-xs text-destructive">{saveError}</p>}

        {/* Word count */}
        {completion && (
          <p className="text-xs text-muted-foreground text-right tabular-nums">
            {completion.split(/\s+/).filter(Boolean).length} words
          </p>
        )}
      </div>
    </div>
  );
}
