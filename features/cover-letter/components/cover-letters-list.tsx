"use client";

import Link from "next/link";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteDialog } from "@/components/shared/bulk-delete-dialog";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { TrashIcon } from "@/features/applications/components/trash-icon";
import { Pagination } from "@/features/applications/components/pagination";
import { CoverLetterCard } from "./cover-letter-card";
import { deleteCoverLetters } from "../actions/delete-cover-letters";
import type { PaginatedCoverLetters } from "../actions/get-cover-letters";

interface CoverLettersListProps {
  result: PaginatedCoverLetters;
}

export function CoverLettersList({ result }: CoverLettersListProps) {
  const { data: letters, total, page, pages, limit } = result;
  const {
    selected,
    setSelected,
    allSelected,
    someSelected,
    pendingDelete,
    setPendingDelete,
    isPending,
    toggleAll,
    toggleOne,
    confirmDelete,
  } = useBulkSelection(letters, deleteCoverLetters);

  const deleteCount = pendingDelete?.length ?? 0;

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
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={(checked) => toggleAll(checked === true)}
                aria-label="Select all cover letters"
              />
              {selected.size > 0 ? `${selected.size} selected` : "Select all"}
            </label>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  disabled={isPending}
                  onClick={() => setPendingDelete(Array.from(selected))}
                >
                  <TrashIcon size={14} />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {letters.map((letter) => (
              <CoverLetterCard
                key={letter.id}
                letter={letter}
                selected={selected.has(letter.id)}
                onSelectChange={(checked) => toggleOne(letter.id, checked)}
                onDelete={() => setPendingDelete([letter.id])}
                deleteDisabled={isPending}
              />
            ))}
          </div>
          <Pagination page={page} pages={pages} total={total} limit={limit} />
        </>
      )}

      <BulkDeleteDialog
        open={pendingDelete !== null}
        count={deleteCount}
        itemLabel="cover letter"
        itemLabelPlural="cover letters"
        isPending={isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        description="This action cannot be undone."
      />
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
