"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import type { ActivityFilter } from "../actions/get-activity";

const TABS: { value: ActivityFilter; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function ActivityFilterTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = (searchParams.get("filter") as ActivityFilter) ?? "30d";

  return (
    <div className="flex flex-wrap items-center gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("filter", tab.value);
            startTransition(() =>
              router.push(`${pathname}?${params.toString()}`),
            );
          }}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            current === tab.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            isPending && "opacity-60 pointer-events-none",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
