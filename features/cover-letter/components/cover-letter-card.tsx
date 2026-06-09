import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SavedCoverLetter } from "../actions/get-cover-letters";

interface CoverLetterCardProps {
  letter: SavedCoverLetter;
}

export function CoverLetterCard({ letter }: CoverLetterCardProps) {
  const wordCount = letter.content.split(/\s+/).filter(Boolean).length;
  const excerpt = letter.content.slice(0, 140).trimEnd();

  return (
    <div className="rounded-lg border bg-card px-4 py-3 flex items-start gap-3">
      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {letter.application ? (
          <Link
            href={`/applications/${letter.application.id}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {letter.application.role} at {letter.application.company}
          </Link>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            Standalone letter
          </span>
        )}
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {excerpt}
          {letter.content.length > 140 ? "…" : ""}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">{wordCount} words</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}
