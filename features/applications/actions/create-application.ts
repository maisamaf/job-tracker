"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import { CreateApplicationInput, createApplicationSchema, type ActionState } from "../schemas";

export async function createApplication(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState<CreateApplicationInput>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { errors: { root: ["You must be signed in"] } };
  }

  // Pull raw values to echo back on validation failure
  const rawValues = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;

  const parsed = createApplicationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as ActionState["errors"],
      values: rawValues,
    };
  }

  const data = parsed.data;

  const [application] = await db
    .insert(applications)
    .values({
      userId: session.user.id,
      company: data.company,
      role: data.role,
      status: data.status,
      location: data.location || null,
      jobUrl: data.jobUrl || null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      description: data.description || null,
      notes: data.notes || null,
      appliedAt: data.appliedAt ?? null,
    })
    .returning({ id: applications.id });

  if (application.id && (data.description || data.jobUrl)) {
    // Fire ingest → gap analysis as a sequential non-blocking chain.
    // This way scraping doesn't block the gap analysis call — ingest completes
    // before gap analysis runs so runGapAnalysis always finds a ready posting.
    (async () => {
      try {
        const { ingestPosting } = await import("@/features/job-intel/actions/ingest-posting");
        await ingestPosting(
          application.id,
          data.jobUrl || undefined,
          data.description || undefined
        );
      } catch (err) {
        console.error("Background ingest failed:", err);
        return; // Don't attempt gap analysis if ingest failed
      }
      try {
        const { db } = await import("@/lib/db");
        const { userProfiles } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");
        
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, session.user.id),
        });
        
        if (!profile || (!profile.cvRawText && !profile.skills)) {
          return; // Skip analysis if profile is empty or missing
        }

        const { runGapAnalysis } = await import("@/features/gap-analysis/actions/run-gap-analysis");
        await runGapAnalysis(application.id);
      } catch (err) {
        console.error("Background gap analysis failed:", err);
      }
    })();
  }

  redirect(`/applications/${application.id}`);
}
