import { stripJsonFences } from "@/lib/ai/json";
import type { ParsedCV } from "../types";

export async function streamAndParseCv(
  cvText: string,
  options?: {
    aiProvider?: string;
    aiModel?: string;
    /** Called with each text chunk as it arrives — use to show a live preview */
    onChunk?: (chunk: string) => void;
  },
): Promise<ParsedCV> {
  const res = await fetch("/api/profile/parse-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cvText,
      aiProvider: options?.aiProvider,
      aiModel: options?.aiModel,
    }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? "CV parsing failed");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let raw = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    raw += chunk;
    options?.onChunk?.(chunk);
  }

  const clean = stripJsonFences(raw);

  try {
    return JSON.parse(clean) as ParsedCV;
  } catch (err) {
    console.error("Failed to parse CV JSON output:", clean, err);
    throw new Error(
      "The AI returned a response that could not be parsed as JSON. " +
        "Try again or switch to a different model.",
    );
  }
}
