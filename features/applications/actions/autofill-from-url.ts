"use server";

import { z } from "zod";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { generateJsonObject } from "@/lib/ai/generate-json-object";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export interface AutofillResult {
  company?: string;
  role?: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
}

/** Discriminated union — never throws so React 19 error boundaries aren't triggered. */
export type AutofillResponse =
  | ({ ok: true } & AutofillResult)
  | { ok: false; error: string };

const autofillSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
});

async function getModel() {
  const session = await auth();
  let aiProvider: string | null = null;
  let aiModel: string | null = null;
  if (session?.user?.id) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { aiProvider: true, aiModel: true },
    });
    aiProvider = user?.aiProvider ?? null;
    aiModel = user?.aiModel ?? null;
  }
  return getLanguageModel({
    provider: (aiProvider as AIProvider) || undefined,
    modelName: aiModel ?? undefined,
  });
}

function buildPrompt(text: string) {
  return `You are a job posting parser. Extract the following fields from the job posting text below.

Fields to extract:
- company: the hiring company name
- role: the job title / position name
- location: city, country or "Remote" (leave empty if not mentioned)
- description: the complete job description text as-is (the full posting body, NOT a summary)
- salaryMin: the minimum salary as a plain integer (no currency symbols, no commas). Omit if not mentioned.
- salaryMax: the maximum salary as a plain integer (no currency symbols, no commas). Omit if not mentioned.

Return ONLY a JSON object with these six keys. If a field cannot be determined, omit it.

Job posting text:
---
${text.slice(0, 8000)}
---`;
}

/**
 * Normalises a job URL before fetching.
 *
 * LinkedIn "recommended" / "collections" pages embed the job ID as a query
 * param (currentJobId). We convert those to the canonical /jobs/view/{id}
 * URL that Jina Reader can actually read.
 *
 * Indeed "viewjob" pages use a "jk" query param — convert to /viewjob?jk=...
 * which is the canonical form that returns readable HTML.
 */
function normalizeJobUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw; // not a valid URL, return as-is
  }

  const host = url.hostname.toLowerCase();

  // LinkedIn: collections, recommended, search, or any page with currentJobId param
  if (host.includes("linkedin.com")) {
    const jobId = url.searchParams.get("currentJobId");
    if (jobId) {
      return `https://www.linkedin.com/jobs/view/${jobId}/`;
    }
    // Already a /jobs/view/{id} URL — keep as-is
    return raw;
  }

  // Indeed: viewjob page is canonical
  if (host.includes("indeed.com")) {
    const jk = url.searchParams.get("jk");
    if (jk) {
      return `https://www.indeed.com/viewjob?jk=${jk}`;
    }
    return raw;
  }

  return raw;
}

/**
 * Fetches a job URL via Jina Reader (r.jina.ai) which handles JavaScript
 * rendering and bot-protected sites like LinkedIn and Indeed, then uses the
 * AI to extract structured fields.
 *
 * Returns a discriminated union — never throws — so React 19 async-transition
 * errors don't trigger error boundaries.
 */
export async function autofillFromUrl(url: string): Promise<AutofillResponse> {
  console.log("[autofillFromUrl] Action started with URL:", url);
  const normalized = normalizeJobUrl(url.trim());
  const apiKey = process.env.JINA_API_KEY;

  const jinaUrl = `https://r.jina.ai/${normalized}`;
  const headers: Record<string, string> = {
    Accept: "text/plain",
    "X-Return-Format": "text",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    response = await fetch(jinaUrl, { headers, signal: controller.signal });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[autofillFromUrl] Scraping failed:", err);
    if (err instanceof Error && err.name === "AbortError") {
      return {
        ok: false,
        error: "Scraping request timed out. Try the \"Paste description\" tab instead.",
      };
    }
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to fetch the job URL. Try the \"Paste description\" tab instead.",
    };
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    console.warn("[autofillFromUrl] Scraping response not OK:", response.status);
    return {
      ok: false,
      error: `Could not fetch job URL (HTTP ${response.status}). Try the "Paste description" tab instead.`,
    };
  }

  const text = await response.text();

  if (!text || text.length < 100) {
    console.warn("[autofillFromUrl] Scraping returned empty or too short text:", text?.length);
    return {
      ok: false,
      error: "Could not extract content from this URL. Try the \"Paste description\" tab instead.",
    };
  }

  let result: AutofillResult;
  try {
    const model = await getModel();
    console.log("[autofillFromUrl] AI Model resolved. Calling generateJsonObject...");
    result = await generateJsonObject({
      model,
      schema: autofillSchema,
      prompt: buildPrompt(text),
      maxAttempts: 2,
    });
    console.log("[autofillFromUrl] AI extraction result:", result);
  } catch (err) {
    console.error("[autofillFromUrl] AI extraction failed:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "AI extraction failed. Try the \"Paste description\" tab instead.",
    };
  }

  const hasAnyField =
    result.company || result.role || result.location || result.description;
  if (!hasAnyField) {
    console.warn("[autofillFromUrl] AI returned empty fields:", result);
    return {
      ok: false,
      error:
        "Could not extract job details from this URL — the page may require login. Try the \"Paste description\" tab instead.",
    };
  }

  const responseObj = { ok: true, ...result };
  console.log("[autofillFromUrl] Returning success:", responseObj);
  return responseObj as AutofillResponse;
}

/**
 * Parses a raw pasted job description text using the AI to extract structured
 * fields.
 *
 * Returns a discriminated union — never throws — so React 19 async-transition
 * errors don't trigger error boundaries.
 */
export async function autofillFromText(
  text: string
): Promise<AutofillResponse> {
  console.log("[autofillFromText] Action started with text length:", text?.length);
  if (!text || text.trim().length < 20) {
    return { ok: false, error: "Please paste more text." };
  }

  let result: AutofillResult;
  try {
    const model = await getModel();
    console.log("[autofillFromText] AI Model resolved. Calling generateJsonObject...");
    result = await generateJsonObject({
      model,
      schema: autofillSchema,
      prompt: buildPrompt(text),
      maxAttempts: 2,
    });
    console.log("[autofillFromText] AI extraction result:", result);
  } catch (err) {
    console.error("[autofillFromText] AI extraction failed:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "AI extraction failed. Make sure your AI provider is configured.",
    };
  }

  const hasAnyField =
    result.company || result.role || result.location || result.description;
  if (!hasAnyField) {
    console.warn("[autofillFromText] AI returned empty fields:", result);
    return {
      ok: false,
      error:
        "Could not extract job details from the pasted text. Make sure you paste the full job description.",
    };
  }

  const responseObj = { ok: true, ...result };
  console.log("[autofillFromText] Returning success:", responseObj);
  return responseObj as AutofillResponse;
}
