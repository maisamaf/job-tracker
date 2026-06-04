import Link from "next/link";
import type { SavedCoverLetter } from "../actions/get-cover-letters";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";

interface SavedLettersProps {
  letters: SavedCoverLetter[];
}

export function SavedLetters({ letters }: SavedLettersProps) {
  if (letters.length === 0) return null;

  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="text-base font-semibold mb-4">
        Saved letters{" "}
        <span className="text-sm font-normal text-muted-foreground">
          ({letters.length})
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="rounded-lg border bg-card px-4 py-3 flex items-start gap-3"
          >
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {letter.application ? (
                <Link
                  href={`/applications/${letter.application.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {letter.application.role} at{" "}
                  {letter.application.company}
                </Link>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Standalone letter
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {letter.content.slice(0, 120)}...
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(letter.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
