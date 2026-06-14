"use server";

import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import { autofillFromUrl } from "./autofill-from-url";

export type QuickCreateResult =
  | { ok: true; id: string; company: string; role: string }
  | { ok: false; error: string };

/**
 * Takes a job posting URL, scrapes and parses it via AI,
 * then inserts a new application with defaults and fires off the
 * background ingest → gap-analysis pipeline — all without needing
 * the user to fill out a form.
 *
 * Returns a discriminated union instead of throwing so the client
 * never sees an HTTP 500 — errors are serialised as { ok: false, error }.
 */
export async function quickCreateFromUrl(url: string): Promise<QuickCreateResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const trimmedUrl = url.trim();

  // 1. Scrape + parse the job posting (returns { ok, ...} — never throws)
  const parsed = await autofillFromUrl(trimmedUrl);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  // Fallback values in case the LLM couldn't extract a company/role
  const company = parsed.company?.trim() || "Unknown Company";
  const role = parsed.role?.trim() || "Unknown Role";

  // 2. Insert the application
  let application: { id: string };
  try {
    const [row] = await db
      .insert(applications)
      .values({
        userId: session.user.id,
        company,
        role,
        status: "bookmarked",
        type: "full-time",
        location: parsed.location || null,
        jobUrl: trimmedUrl,
        description: parsed.description || null,
        salaryMin: parsed.salaryMin ?? null,
        salaryMax: parsed.salaryMax ?? null,
        notes: null,
        appliedAt: null,
      })
      .returning({ id: applications.id });
    application = row;
  } catch (err) {
    console.error("[quick-create] DB insert failed:", err);
    return { ok: false, error: "Failed to save the application. Please try again." };
  }

  // 3. Fire background ingest → gap-analysis (non-blocking)
  if (application.id) {
    const userId = session.user.id;
    (async () => {
      try {
        const { ingestPosting } = await import(
          "@/features/job-intel/actions/ingest-posting"
        );
        await ingestPosting(
          application.id,
          trimmedUrl,
          parsed.description || undefined
        );
      } catch (err) {
        console.error("[quick-create] Background ingest failed:", err);
        return;
      }

      try {
        const { db: dbInstance } = await import("@/lib/db");
        const { userProfiles } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");

        const profile = await dbInstance.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, userId),
        });

        if (!profile || (!profile.cvRawText && !profile.skills)) {
          return;
        }

        const { runGapAnalysis } = await import(
          "@/features/gap-analysis/actions/run-gap-analysis"
        );
        await runGapAnalysis(application.id);
      } catch (err) {
        console.error("[quick-create] Background gap analysis failed:", err);
      }
    })();
  }

  return { ok: true, id: application.id, company, role };
}
