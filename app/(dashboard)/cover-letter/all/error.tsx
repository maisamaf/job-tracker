"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Cover letters page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium">Failed to load cover letters</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Something went wrong while fetching your cover letters. Please try again.
      </p>
      <div className="flex items-center gap-2 mt-4">
        <Button size="sm" variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/cover-letter">Go to generator</Link>
        </Button>
      </div>
    </div>
  );
}
