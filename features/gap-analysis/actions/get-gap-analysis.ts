"use server";

import { db } from "@/lib/db";
import { gapAnalyses } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export async function getGapAnalysis(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let result = await db.query.gapAnalyses.findFirst({
    where: and(
      eq(gapAnalyses.applicationId, applicationId),
      eq(gapAnalyses.userId, session.user.id)
    ),
  });

  if (!result) {
    const { applications } = await import("@/lib/db/schema");
    const application = await db.query.applications.findFirst({
      where: and(
        eq(applications.id, applicationId),
        eq(applications.userId, session.user.id)
      ),
    });

    if (application && (application.description || application.jobUrl)) {
      const { runGapAnalysis } = await import("./run-gap-analysis");
      // Let errors (like missing profile) propagate to the API handler so the client
      // handles them properly (e.g. shows profile completion requirement).
      result = await runGapAnalysis(applicationId);
    }
  }

  return result || null;
}
