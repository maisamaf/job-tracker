"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { STATUS_CONFIG, STATUS_OPTIONS } from "../types";
import type { ApplicationStatus } from "../types";

const STATUS_TABS: Array<{ value: "all" | ApplicationStatus; label: string }> =
  [
    { value: "all", label: "All" },
    ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
  ];

interface ApplicationsFiltersProps {
  totalCount: number;
}

export function ApplicationsFilters({ totalCount }: ApplicationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentSearch = searchParams.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Keep local state in sync if URL changes externally (e.g. back button)
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchValue(currentSearch);
  }

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Always reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  // Debounce search — wait 400ms after typing stops
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateParams({ search: searchValue });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchValue, currentSearch, updateParams]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company, role, location..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue("");
              updateParams({ search: null });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => updateParams({ status: tab.value })}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Results count */}
        <span
          className={cn(
            "ml-auto text-sm text-muted-foreground transition-opacity",
            isPending && "opacity-50",
          )}
        >
          {totalCount} {totalCount === 1 ? "application" : "applications"}
        </span>
      </div>
    </div>
  );
}
