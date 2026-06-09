"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, MapPin, ArrowRight, Loader2, FileX2 } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import { useSearchApplications } from "../hooks/use-search-applications";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import type { SearchApplicationResult } from "../actions/search-applications";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 280);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, isLoading } = useSearchApplications(debouncedQuery);
  // Stable empty array fallback — avoids new reference on every render
  const results: SearchApplicationResult[] = useMemo(() => data ?? [], [data]);

  const hasQuery = debouncedQuery.trim().length > 0;
  const showSkeleton = hasQuery && isLoading;
  const showResults = hasQuery && results.length > 0;
  const showEmpty =
    hasQuery && !isFetching && !isLoading && results.length === 0;
  const showPrompt = !hasQuery;

  // Clamp selectedIndex so it never goes out of bounds
  const safeIndex =
    results.length > 0 ? Math.min(selectedIndex, results.length - 1) : 0;

  // Scroll selected item into view whenever it changes
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>(`[data-idx="${safeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [safeIndex]);

  // Clear internal state when the dialog is closed
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setQuery("");
        setSelectedIndex(0);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange],
  );

  const navigateTo = useCallback(
    (result: SearchApplicationResult) => {
      router.push(`/applications/${result.id}`);
      onOpenChange(false);
    },
    [router, onOpenChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length) setSelectedIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length)
          setSelectedIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[safeIndex];
        if (hit) navigateTo(hit);
      }
    },
    [results, safeIndex, navigateTo],
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-label="Search applications"
          className={cn(
            // Positioning — top-aligned
            "fixed left-1/2 top-[12%] z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 outline-none",
            "sm:max-w-140",
            // Surface
            "overflow-hidden rounded-2xl bg-popover text-popover-foreground",
            "shadow-2xl shadow-black/20 ring-1 ring-foreground/10",

            "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
          onKeyDown={handleKeyDown}
          // Radix auto-moves focus to the first focusable element on open;
          // we override that to target our input directly.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {/* ── Search input  */}
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
            {isFetching && hasQuery ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0); // reset selection when user types
              }}
              placeholder="Search by company, role, or location…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                tabIndex={-1}
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="rounded text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <Kbd className="cursor-pointer">esc</Kbd>
              </button>
            )}
          </div>

          {/* ── Body  */}
          <div className="min-h-25">
            {/* Loading skeletons */}
            {showSkeleton && (
              <div className="space-y-0.5 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  >
                    <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div ref={listRef} className="max-h-85 overflow-y-auto p-2">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </p>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    data-idx={index}
                    onClick={() => navigateTo(result)}
                    onMouseMove={() => setSelectedIndex(index)}
                    className={cn(
                      "group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      safeIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                    )}
                  >
                    {/* Company avatar */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase transition-colors",
                        safeIndex === index
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                      aria-hidden
                    >
                      {result.company.charAt(0)}
                    </div>

                    {/* Main content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {result.company}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <span className="truncate">{result.role}</span>
                        {result.location && (
                          <>
                            <span className="shrink-0 text-muted-foreground/30">
                              ·
                            </span>
                            <span className="flex shrink-0 items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {result.location}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Status + arrow */}
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={result.status} />
                      <ArrowRight
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-opacity",
                          safeIndex === index ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="flex flex-col items-center gap-2.5 py-12 text-center">
                <FileX2 className="h-8 w-8 text-muted-foreground/25" />
                <div>
                  <p className="text-sm font-medium">
                    No results for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Try a different company name, role, or location
                  </p>
                </div>
              </div>
            )}

            {/* Initial prompt */}
            {showPrompt && (
              <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-center">
                <SearchIcon className="h-7 w-7 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">
                  Search across all your applications
                </p>
              </div>
            )}
          </div>

          {/* ── Footer  */}
          <div className="flex items-center gap-4 border-t border-border/60 bg-muted/30 px-4 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex gap-0.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </span>
              navigate
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>↵</Kbd>
              open
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>esc</Kbd>
              close
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              to search
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
