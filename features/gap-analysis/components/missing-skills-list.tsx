"use client";

import { Badge } from "@/components/ui/badge";

interface MissingSkillsListProps {
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
}

export function MissingSkillsList({ matchedSkills, partialSkills, missingSkills }: MissingSkillsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Matched */}
      <div className="p-4 border rounded-lg bg-emerald-500/5 border-emerald-500/20">
        <h4 className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500"></span>
          Matched Skills ({matchedSkills.length})
        </h4>
        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border-transparent">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No matches found.</p>
        )}
      </div>

      {/* Partial */}
      <div className="p-4 border rounded-lg bg-amber-500/5 border-amber-500/20">
        <h4 className="font-semibold text-sm text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500"></span>
          Partial Match ({partialSkills.length})
        </h4>
        {partialSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {partialSkills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border-transparent">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No partial matches found.</p>
        )}
      </div>

      {/* Missing */}
      <div className="p-4 border rounded-lg bg-rose-500/5 border-rose-500/20">
        <h4 className="font-semibold text-sm text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-500"></span>
          Missing Skills ({missingSkills.length})
        </h4>
        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 border-transparent">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No missing skills identified.</p>
        )}
      </div>
    </div>
  );
}
