"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Check } from "lucide-react";

export function ExportButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleExport() {
    setState("loading");

    try {
      const response = await fetch("/api/export/applications");

      if (!response.ok) throw new Error("Export failed");

      // Stream the response into a Blob and trigger a browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const filename =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+?)"/)?.[1] ?? "applications.csv";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("idle");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={state === "loading"}
      className="gap-2"
    >
      {state === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === "done" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
      {state === "idle" && <Download className="h-3.5 w-3.5" />}
      {state === "done" ? "Downloaded" : "Export CSV"}
    </Button>
  );
}
