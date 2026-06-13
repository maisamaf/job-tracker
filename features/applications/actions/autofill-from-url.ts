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
}

const autofillSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
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

Return ONLY a JSON object with these four keys. If a field cannot be determined, omit it.

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
 */
export async function autofillFromUrl(url: string): Promise<AutofillResult> {
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
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Scraping request timed out. Please try the \"Paste description\" tab instead.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(
      `Could not fetch job URL (${response.status}). Try the "Paste description" tab instead.`
    );
  }

  const text = await response.text();

  if (!text || text.length < 100) {
    throw new Error(
      "Could not extract content from this URL. Try the \"Paste description\" tab instead."
    );
  }

  const model = await getModel();
  const result = await generateJsonObject({
    model,
    schema: autofillSchema,
    prompt: buildPrompt(text),
    maxAttempts: 2,
  });

  // If the LLM found nothing useful, the page was likely a login wall or
  // generic listing — show a clear message.
  const hasAnyField = result.company || result.role || result.location || result.description;
  if (!hasAnyField) {
    throw new Error(
      "Could not extract job details from this URL — the page may require login. Try the \"Paste description\" tab instead."
    );
  }

  return result;
}

/**
 * Parses a raw pasted job description text using the AI to extract structured
 * fields.
 */
export async function autofillFromText(text: string): Promise<AutofillResult> {
  if (!text || text.trim().length < 20) {
    throw new Error("Please paste more text.");
  }

  const model = await getModel();
  const result = await generateJsonObject({
    model,
    schema: autofillSchema,
    prompt: buildPrompt(text),
    maxAttempts: 2,
  });

  const hasAnyField = result.company || result.role || result.location || result.description;
  if (!hasAnyField) {
    throw new Error("Could not extract job details from the pasted text. Make sure you paste the full job description.");
  }

  return result;
}
