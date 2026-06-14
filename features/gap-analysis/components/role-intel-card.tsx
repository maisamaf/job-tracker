"use client";

import { useState } from "react";
import type { JobPosting } from "@/lib/db/schema";
import { Briefcase, Award, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleIntelCardProps {
  posting: JobPosting;
}

const RESPONSIBILITIES_PREVIEW = 3;

export function RoleIntelCard({ posting }: RoleIntelCardProps) {
  const [showAll, setShowAll] = useState(false);

  const requiredSkills: string[] = posting.requiredSkills ? JSON.parse(posting.requiredSkills) : [];
  const niceToHave: string[] = posting.niceToHave ? JSON.parse(posting.niceToHave) : [];
  const responsibilities: string[] = posting.responsibilities ? JSON.parse(posting.responsibilities) : [];

  const visibleResp = showAll ? responsibilities : responsibilities.slice(0, RESPONSIBILITIES_PREVIEW);
  const hiddenCount = responsibilities.length - RESPONSIBILITIES_PREVIEW;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Role intel</h3>
        </div>
        {posting.status === "ready" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            Analysed
          </span>
        )}
      </div>

      {/* Meta badges */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {posting.seniorityLevel && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-background-chip">
            <Award className="size-3.5 text-muted-foreground" />
            {posting.seniorityLevel.charAt(0).toUpperCase() + posting.seniorityLevel.slice(1)}
          </span>
        )}
        {posting.remotePolicy && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-background-chip">
            <Globe className="size-3.5 text-muted-foreground" />
            {posting.remotePolicy.charAt(0).toUpperCase() + posting.remotePolicy.slice(1)}
          </span>
        )}
        {posting.companySize && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-background-chip">
            <Users className="size-3.5 text-muted-foreground" />
            ~{posting.companySize}
          </span>
        )}
      </div>

      {/* Skills grid */}
      {(requiredSkills.length > 0 || niceToHave.length > 0) && (
        <div className="px-5 pb-4">
          <div className={cn("grid gap-x-6 gap-y-3", requiredSkills.length > 0 && niceToHave.length > 0 ? "grid-cols-2" : "grid-cols-1")}>
            {/* Required */}
            {requiredSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold tracking-widest text-foreground/60 uppercase">
                  Required
                </p>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nice to have */}
            {niceToHave.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold tracking-widest text-foreground/60 uppercase">
                  Nice to have
                </span>
                <div className="flex flex-wrap gap-2">
                  {niceToHave.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <>
          <div className="border-t border-border mx-5" />
          <div className="px-5 py-4 space-y-2">
            <span className="text-[10px] font-semibold tracking-widest text-foreground/60 uppercase">
              Responsibilities
            </span>
            <ul className="space-y-1.5 pt-1">
              {visibleResp.map((responsibility, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                +{hiddenCount} more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
