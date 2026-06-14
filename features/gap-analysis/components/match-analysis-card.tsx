"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GapAnalysis } from "@/lib/db/schema";

interface MatchAnalysisCardProps {
  analysis: GapAnalysis;
  onRerun: () => void;
  isRerunning: boolean;
}

function CircularScore({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-muted/30"
        />
        {/* Progress */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground leading-none">{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">match</span>
      </div>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SkillTag({
  label,
  variant,
}: {
  label: string;
  variant: "matched" | "missing" | "partial";
}) {
  const styles = {
    matched:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
    missing:
      "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
    partial:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

export function MatchAnalysisCard({ analysis, onRerun, isRerunning }: MatchAnalysisCardProps) {
  const matchedSkills: string[] = analysis.matchedSkills ? JSON.parse(analysis.matchedSkills) : [];
  const partialSkills: string[] = analysis.partialSkills ? JSON.parse(analysis.partialSkills) : [];
  const missingSkills: string[] = analysis.missingSkills ? JSON.parse(analysis.missingSkills) : [];
  const recommendations: string[] = analysis.recommendations ? JSON.parse(analysis.recommendations) : [];

  const skillScore = analysis.skillMatchScore ?? 0;
  const expScore = analysis.experienceScore ?? 0;
  const overallScore = analysis.overallMatchScore ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <span className="size-4 rounded border border-border inline-block" />
          <h3 className="text-base font-semibold text-foreground">Match analysis</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRerun}
          disabled={isRerunning}
          className="h-7 px-3 text-xs font-medium rounded-lg gap-1.5"
        >
          {isRerunning ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Re-running…
            </>
          ) : (
            <>
              <span className="size-3 rounded-sm border border-current inline-block" />
              Re-run
            </>
          )}
        </Button>
      </div>

      {/* Scores */}
      <div className="px-5 pb-5 flex items-center gap-5">
        <CircularScore score={overallScore} />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Skills</span>
            <ProgressBar value={skillScore} color="#22c55e" />
            <span className="text-sm font-semibold text-foreground w-9 text-right">{skillScore}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Experience</span>
            <ProgressBar value={expScore} color="#f59e0b" />
            <span className="text-sm font-semibold text-foreground w-9 text-right">{expScore}%</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border mx-5" />

      {/* Summary */}
      {analysis.summary && (
        <p className="px-5 py-4 text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
      )}

      {/* Skills breakdown */}
      <div className="flex shrink-0 flex-wrap gap-4 px-4 mb-4">
        {matchedSkills.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Matched
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {matchedSkills.map((s) => (
                <SkillTag key={s} label={s} variant="matched" />
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-rose-500 uppercase">
              Missing
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {missingSkills.map((s) => (
                <SkillTag key={s} label={s} variant="missing" />
              ))}
            </div>
          </div>
        )}

        {partialSkills.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
              Partial
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {partialSkills.map((s) => (
                <SkillTag key={s} label={s} variant="partial" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <>
          <div className="border-t border-border mx-5" />
          <div className="px-5 py-4 space-y-2">
            <span className="text-[10px] font-semibold tracking-widest text-foreground/60 uppercase">
              Recommendations
            </span>
            <ul className="space-y-2 pt-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground/50 mt-0.5 shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
