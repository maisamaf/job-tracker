"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { LinkIcon, Zap } from "lucide-react";
import { toast } from "sonner";
import { quickCreateFromUrl } from "../actions/quick-create-from-url";
import { useNotifications } from "@/lib/notifications";

interface QuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreateDialog({ open, onOpenChange }: QuickCreateDialogProps) {
  const router = useRouter();
  const { push: pushNotification } = useNotifications();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setUrl("");
        setError(null);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Client-side URL validation only — don't block UI for server work
    try {
      new URL(trimmed);
    } catch {
      setError("Please enter a valid URL (e.g. https://...)");
      return;
    }

    // ── Fire-and-forget: close the dialog immediately
    handleOpenChange(false);

    const promise = quickCreateFromUrl(trimmed).then((result) => {
      if (!result.ok) {
        throw new Error(result.error);
      }

      // Push to notification centre on success
      pushNotification({
        title: "Application added",
        body: `${result.company} — ${result.role}`,
        href: `/applications/${result.id}`,
      });

      // Refresh any visible lists
      router.refresh();

      return result;
    });

    // sonner promise toast — loading → success/error without blocking the UI
    toast.promise(promise, {
      loading: "Fetching and saving job posting…",
      success: (result) => ({
        message: "Application added!",
        description: `${result.company} — ${result.role}`,
        action: {
          label: "View",
          onClick: () => router.push(`/applications/${result.id}`),
        },
      }),
      error: (err) =>
        err instanceof Error ? err.message : "Failed to add application. Please try again.",
    });
  }, [url, handleOpenChange, pushNotification, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-label="Quick-add application from URL"
          className={cn(
            "fixed left-1/2 top-[12%] z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 outline-none",
            "sm:max-w-140",
            "overflow-hidden rounded-2xl bg-popover text-popover-foreground",
            "shadow-2xl shadow-black/20 ring-1 ring-foreground/10",
            "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          )}
          onKeyDown={handleKeyDown}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {/* ── Header */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Add
            </span>
          </div>

          {/* ── Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              id="quick-add-url-input"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste a job posting URL and press Enter…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {url && (
              <button
                tabIndex={-1}
                onClick={() => {
                  setUrl("");
                  setError(null);
                  inputRef.current?.focus();
                }}
                className="rounded text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear URL"
              >
                <Kbd className="cursor-pointer">esc</Kbd>
              </button>
            )}
          </div>

          {/* ── Error feedback (URL validation only — server errors go to the toast) */}
          {error && (
            <div className="border-t border-border/60 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ── Footer */}
          <div className="flex items-center gap-4 border-t border-border/60 bg-muted/30 px-4 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>↵</Kbd>
              save &amp; close
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>esc</Kbd>
              close
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>⌘</Kbd>
              <Kbd>J</Kbd>
              quick add
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
