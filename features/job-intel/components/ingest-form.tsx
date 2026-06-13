"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface IngestFormProps {
  initialUrl: string;
  initialText: string;
  onSubmit: (url?: string, text?: string) => void;
  isLoading: boolean;
}

export function IngestForm({ initialUrl, initialText, onSubmit, isLoading }: IngestFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState<"url" | "text">(initialUrl ? "url" : "text");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (mode === "url" && url) {
      onSubmit(url, text || undefined);
    } else {
      onSubmit(undefined, text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 border-b pb-2">
        <button
          type="button"
          className={`text-sm font-medium pb-2 border-b-2 transition-all ${mode === "url"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setMode("url")}
        >
          Import from Job URL
        </button>
        <button
          type="button"
          className={`text-sm font-medium pb-2 border-b-2 transition-all ${mode === "text"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setMode("text")}
        >
          Paste Description Text
        </button>
      </div>

      {mode === "url" ? (
        <div className="space-y-2">
          <Label htmlFor="job-url">Job Listing URL</Label>
          <Input
            id="job-url"
            placeholder="https://example.com/jobs/123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            We will scrape the webpage content and extract details automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="job-text">Job Description</Label>
          <Textarea
            id="job-text"
            placeholder="Paste the full job description text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            required
            disabled={isLoading}
          />
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Analyzing..." : "Analyze Job Posting"}
      </Button>
    </form>
  );
}
