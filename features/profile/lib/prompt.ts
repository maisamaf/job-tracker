// The model is instructed to return ONLY valid JSON — no markdown, no explanation.
// The caller buffers the full stream and JSON.parses once complete.

export interface ParseCvPromptInput {
  cvRawText: string;
}

/**
 * Strict JSON-only extraction prompt.
 *
 * Design decisions:
 * - "ONLY" and "EXACT SHAPE" are emphasised because every provider tested
 *   (Claude, GPT-4o, Gemini) will add markdown fences or a preamble unless
 *   explicitly told not to, especially on long inputs.
 * - The JSON shape is spelled out in the prompt itself so the model has a
 *   concrete target rather than an abstract instruction.
 * - `yearsOfExperience` is a derived number so the UI can display it without
 *   parsing the experience array every time.
 * - `languages` covers spoken/written languages (German, English…) separately
 *   from `programmingLanguages` to avoid confusion — both arrays appear in CVs.
 * - `certifications` is included because it surfaces frequently in job postings
 *   (AWS certs, etc.) and is easy to miss if not explicitly requested.
 * - Bullet points in experience are kept as a flat string[] rather than nested
 *   objects to keep the schema simple on the first pass.
 */
/** Prompt for the settings/profile CV parser (simple JSON shape). */
export function buildSimpleParseCvPrompt(cvText: string): string {
  return `You are a professional CV parser used inside a job application tracker.

Extract structured information from the CV text below and return it as JSON.

Rules:
1. Respond ONLY with a single valid JSON object — no markdown, no headings, no code fences.
2. If a field cannot be determined, use an empty array for lists or an empty string for summary.
3. Keep text in the same language as the CV.

Required JSON shape:
{
  "skills": ["string"] — all technical and soft skills, deduplicated,
  "experience": [
    {
      "company": "string",
      "role": "string",
      "years": "string — date range e.g. '10/2021 – 09/2023'",
      "bullets": ["string"] — key accomplishments, one per item
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string — graduation or date range"
    }
  ],
  "languages": ["string"] — spoken/written languages e.g. ["English", "German"],
  "summary": "string — concise 2-sentence professional summary in first person"
}

CV text:
---
${cvText}
---`;
}

export function buildParseCvPrompt({ cvRawText }: ParseCvPromptInput): string {
  return `You are an expert CV parser used inside a job application tracker.

Your task is to extract structured data from the CV text provided below.

CRITICAL RULES — follow them exactly:
1. Respond ONLY with a single valid JSON object.
2. Do NOT wrap the JSON in markdown code fences (\`\`\`json or \`\`\`).
3. Do NOT add any explanation, preamble, or commentary before or after the JSON.
4. If a field cannot be determined from the CV, use null for scalar fields or [] for arrays.
5. All text values must be in the same language as the CV (do not translate).

OUTPUT SHAPE — return exactly this structure:

{
  "fullName": "string or null",
  "currentTitle": "string or null — the most recent job title",
  "summary": "string — write a concise 2-sentence professional summary in third person based on the CV. Do not invent facts.",
  "yearsOfExperience": "number or null — total years of professional experience, rounded to nearest 0.5",
  "skills": ["string"] — all technical and professional skills mentioned anywhere in the CV, deduplicated],
  "programmingLanguages": ["string"] — only programming/scripting languages e.g. TypeScript, Python, SQL],
  "frameworks": ["string"] — frameworks and libraries e.g. React, Next.js, Spring Boot],
  "tools": ["string"] — dev tools, platforms, services e.g. GitHub Actions, Vercel, Figma],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string or null — e.g. '10/2023'",
      "endDate": "string or null — use 'Present' if current role",
      "bullets": ["string"] — each achievement or responsibility as a separate string
    }
  ],
  "education": [
    {
      "degree": "string — e.g. 'M.Sc. Computer Science'",
      "institution": "string",
      "startYear": "number or null",
      "endYear": "number or null — use null if still in progress",
      "inProgress": "boolean"
    }
  ],
  "certifications": ["string"] — any certifications mentioned, or []],
  "languages": [
    {
      "language": "string — spoken/written language e.g. English, German",
      "level": "string or null — e.g. 'Native', 'Fluent', 'B2', 'Basic'"
    }
  ],
  "location": "string or null — city and country if mentioned"
}

CV TEXT TO PARSE:
---
${cvRawText}
---`;
}

/**
 * Strips markdown code fences that some providers add despite instructions.
 *
 * Usage: JSON.parse(stripJsonFences(rawStreamOutput))
 *
 * Handles:
 *   ```json\n{...}\n```
 *   ```\n{...}\n```
 *   {…}  (already clean — returned as-is)
 */
export { stripJsonFences } from "@/lib/ai/json";
