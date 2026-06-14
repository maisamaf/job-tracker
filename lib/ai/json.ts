/**
 * Helpers for parsing JSON from LLM output that may include markdown fences
 * or surrounding prose.
 */
export function stripJsonFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export function extractJsonFromText(raw: string): string {
  const cleaned = stripJsonFences(raw.trim());

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return cleaned.slice(start, end + 1);
    }
  }

  return cleaned;
}

export function buildJsonRetryPrompt(
  basePrompt: string,
  invalidOutput: string,
  errorMessage: string,
): string {
  return `${basePrompt}

Your previous response was NOT valid JSON and could not be parsed.

Parser error: ${errorMessage}

Invalid response (do NOT repeat this format — no markdown headers, no bullet lists outside JSON):
---
${invalidOutput.slice(0, 4000)}
---

Respond with ONLY a single valid JSON object that matches the required schema. No markdown, no code fences, no explanation.`;
}
