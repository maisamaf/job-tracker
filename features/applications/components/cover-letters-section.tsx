"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { CoverLetter } from "@/lib/db";

interface CoverLettersSectionProps {
  applicationId: string;
  coverLetters: CoverLetter[];
}

function CoverLetterCard({ letter }: { letter: CoverLetter }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Generated{" "}
            {formatDistanceToNow(new Date(letter.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </div>

      {/* Content */}
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
        <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No cover letters generated yet
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cover-letter?applicationId=${applicationId}`}>
              Generate one
            </Link>
          </Button>
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
