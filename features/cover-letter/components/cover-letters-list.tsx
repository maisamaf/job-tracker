import Link from "next/link";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/applications/components/pagination";
import { CoverLetterCard } from "./cover-letter-card";
import type { PaginatedCoverLetters } from "../actions/get-cover-letters";

interface CoverLettersListProps {
  result: PaginatedCoverLetters;
}

export function CoverLettersList({ result }: CoverLettersListProps) {
  const { data: letters, total, page, pages, limit } = result;

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          href="/cover-letter"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Cover letter generator
        </Link>
      </div>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            All cover letters
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "letter" : "letters"} saved
          </p>
        </div>
        <Button asChild>
          <Link href="/cover-letter">
            <Plus className="size-4 mr-2" />
            New letter
          </Link>
        </Button>
      </div>

      {/* Content */}
      {letters.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {letters.map((letter) => (
              <CoverLetterCard key={letter.id} letter={letter} />
            ))}
          </div>
          <Pagination page={page} pages={pages} total={total} limit={limit} />
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
        <FileText className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No cover letters yet</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Generate your first cover letter to get started.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/cover-letter">Generate a cover letter</Link>
      </Button>
    </div>
  );
}
