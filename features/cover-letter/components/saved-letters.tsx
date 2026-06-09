import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverLetterCard } from "./cover-letter-card";
import type { SavedCoverLetter } from "../actions/get-cover-letters";

interface SavedLettersProps {
  letters: SavedCoverLetter[];
  totalCount: number;
}

export function SavedLetters({ letters, totalCount }: SavedLettersProps) {
  if (totalCount === 0) return null;

  return (
    <div className="mt-12 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Recent letters{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({totalCount})
          </span>
        </h2>
        {totalCount > letters.length && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
          >
            <Link href="/cover-letter/all">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {letters.map((letter) => (
          <CoverLetterCard key={letter.id} letter={letter} />
        ))}
      </div>

      {totalCount > letters.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {letters.length} of {totalCount} letters.{" "}
          <Link
            href="/cover-letter/all"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </p>
      )}
    </div>
  );
}
