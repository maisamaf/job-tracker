"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, formatFileSize } from "@/lib/utils";
import type { ApplicationDetail } from "../actions/get-application";

type CoverLetterItem = ApplicationDetail["coverLetters"][number];

interface CoverLettersSectionProps {
  applicationId: string;
  coverLetters: CoverLetterItem[];
}

function CoverLetterCard({ letter }: { letter: CoverLetterItem }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFile = !!letter.fileName;

  async function handleCopy() {
    if (!letter.content) return;
    await navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {isFile ? (
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {isFile ? "Uploaded" : "Generated"}{" "}
            {formatDistanceToNow(new Date(letter.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isFile ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              asChild
            >
              <a href={`/api/cover-letter/${letter.id}/download`}>
                <Download className="h-3 w-3" />
                Download
              </a>
            </Button>
          ) : (
            <>
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
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((v) => !v)}
                className="h-7 gap-1.5 text-xs"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Expand
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isFile ? (
        <a
          href={`/api/cover-letter/${letter.id}/download`}
          className="flex items-center gap-2 px-4 py-3 text-sm hover:text-primary transition-colors"
        >
          <span className="truncate">{letter.fileName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatFileSize(letter.fileSize)}
          </span>
        </a>
      ) : (
        <p
          className={cn(
            "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap transition-all",
            !expanded && "max-h-[120px] overflow-hidden relative",
          )}
        >
          {letter.content}
          {!expanded && (
            <span className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-card to-transparent" />
          )}
        </p>
      )}
    </div>
  );
}

export function CoverLettersSection({
  applicationId,
  coverLetters,
}: CoverLettersSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">
          Cover letters
          {coverLetters.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({coverLetters.length})
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          asChild
        >
          <Link href={`/cover-letter?applicationId=${applicationId}`}>
            <Sparkles className="h-3 w-3" />
            Generate new
          </Link>
        </Button>
      </div>

      {coverLetters.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 bg-background-chip">
          <p className="text-sm text-muted-foreground">
            No cover letters yet. Click Generate to create one tailored to this role.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coverLetters.map((letter) => (
            <CoverLetterCard key={letter.id} letter={letter} />
          ))}
        </div>
      )}
    </section>
  );
}
