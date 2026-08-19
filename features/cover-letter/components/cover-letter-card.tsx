import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SavedCoverLetter } from "../actions/get-cover-letters";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/features/applications/components/trash-icon";
import { formatFileSize } from "@/lib/utils";

interface CoverLetterCardProps {
  letter: SavedCoverLetter;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
}

export function CoverLetterCard({
  letter,
  selected,
  onSelectChange,
  onDelete,
  deleteDisabled,
}: CoverLetterCardProps) {
  const isFile = !!letter.fileName;
  const wordCount = letter.content
    ? letter.content.split(/\s+/).filter(Boolean).length
    : 0;
  const excerpt = letter.content ? letter.content.slice(0, 140).trimEnd() : "";
  const letterLabel = letter.application
    ? `${letter.application.role} at ${letter.application.company}`
    : "Standalone letter";

  return (
    <div className="group rounded-lg border bg-card px-4 py-3 flex items-start gap-3">
      {onSelectChange && (
        <Checkbox
          checked={!!selected}
          onCheckedChange={(checked) => onSelectChange(checked === true)}
          aria-label={`Select ${letterLabel}`}
          className="mt-1 shrink-0"
        />
      )}
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
        {isFile ? (
          <a
            href={`/api/cover-letter/${letter.id}/download`}
            className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Download className="h-3 w-3 shrink-0" />
            <span className="truncate">{letter.fileName}</span>
          </a>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {excerpt}
            {letter.content && letter.content.length > 140 ? "…" : ""}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {isFile ? formatFileSize(letter.fileSize) : `${wordCount} words`}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
      </span>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          <TrashIcon size={16} />
          <span className="sr-only">Delete {letterLabel}</span>
        </Button>
      )}
    </div>
  );
}
