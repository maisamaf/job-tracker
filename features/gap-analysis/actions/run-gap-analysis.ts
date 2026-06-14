"use server";

import { db } from "@/lib/db";
import { gapAnalyses, userProfiles, jobPostings, users, applications } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { generateJsonObject } from "@/lib/ai/generate-json-object";
import { buildGapAnalysisPrompt } from "../lib/prompt";
import { gapAnalysisSchema } from "../types";
import { eq, and } from "drizzle-orm";

export async function runGapAnalysis(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Load user profile
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (!profile || (!profile.cvRawText && !profile.skills)) {
    throw new Error("Complete your profile first");
  }

  // 2. Load application once (needed for auto-ingest fallback + prompt context)
  const application = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    columns: { role: true, company: true, description: true, jobUrl: true },
  });

  // 3. Load job posting
  let posting = await db.query.jobPostings.findFirst({
    where: eq(jobPostings.applicationId, applicationId),
  });

  if (!posting || posting.status !== "ready") {
    if (application && (application.description || application.jobUrl)) {
      const { ingestPosting } = await import("@/features/job-intel/actions/ingest-posting");
      try {
        await ingestPosting(
          applicationId,
          application.jobUrl || undefined,
          application.description || undefined
        );
        // Reload posting
        posting = await db.query.jobPostings.findFirst({
          where: eq(jobPostings.applicationId, applicationId),
        });
      } catch (ingestErr) {
        console.error("Auto-ingesting posting failed:", ingestErr);
      }
    }
  }

  if (!posting || posting.status !== "ready") {
    throw new Error("Job posting analysis is not ready. Please scrape the job details first.");
  }

  // 3. Parse JSON values
  const candidateSkills = profile.skills ? JSON.parse(profile.skills) : [];
  const candidateExperience = profile.experience ? JSON.parse(profile.experience) : [];
  const candidateSummary = profile.summary || "";
  const cvRawText = profile.cvRawText || "";

  const jobRequiredSkills = posting.requiredSkills ? JSON.parse(posting.requiredSkills) : [];
  const jobNiceToHave = posting.niceToHave ? JSON.parse(posting.niceToHave) : [];
  const jobTechStack = posting.techStack ? JSON.parse(posting.techStack) : [];
  const jobResponsibilities = posting.responsibilities ? JSON.parse(posting.responsibilities) : [];

  // 4. Resolve AI Model
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { aiProvider: true, aiModel: true },
  });

  const model = getLanguageModel({
    provider: user?.aiProvider as AIProvider | undefined,
    modelName: user?.aiModel ?? undefined,
  });

  // 6. Build prompt — pass both raw texts for maximum accuracy
  const prompt = buildGapAnalysisPrompt({
    candidate: {
      skills: candidateSkills,
      experience: candidateExperience,
      summary: candidateSummary,
      cvRawText: cvRawText || undefined,
    },
    job: {
      requiredSkills: jobRequiredSkills,
      niceToHave: jobNiceToHave,
      seniorityLevel: posting.seniorityLevel || "mid",
      techStack: jobTechStack,
      responsibilities: jobResponsibilities,
      rawText: posting.rawText || undefined,
      role: application?.role || undefined,
      company: application?.company || undefined,
    },
  });

  // 7. Generate JSON response
  const analysis = await generateJsonObject({
    model,
    schema: gapAnalysisSchema,
    prompt,
    maxAttempts: 3,
  });

  // 7. Insert or update gapAnalyses table
  const existing = await db.query.gapAnalyses.findFirst({
    where: and(
      eq(gapAnalyses.applicationId, applicationId),
      eq(gapAnalyses.userId, session.user.id)
    ),
  });

  const modelUsedStr = user?.aiModel || "default";

  if (existing) {
    const updated = await db
      .update(gapAnalyses)
      .set({
        overallMatchScore: analysis.overallMatchScore,
        skillMatchScore: analysis.skillMatchScore,
        experienceScore: analysis.experienceScore,
        matchedSkills: JSON.stringify(analysis.matchedSkills),
        missingSkills: JSON.stringify(analysis.missingSkills),
        partialSkills: JSON.stringify(analysis.partialSkills),
        recommendations: JSON.stringify(analysis.recommendations),
        summary: analysis.summary,
        modelUsed: modelUsedStr,
      })
      .where(eq(gapAnalyses.id, existing.id))
      .returning();
    return updated[0];
  } else {
    const inserted = await db
      .insert(gapAnalyses)
      .values({
        applicationId,
        userId: session.user.id,
        overallMatchScore: analysis.overallMatchScore,
        skillMatchScore: analysis.skillMatchScore,
        experienceScore: analysis.experienceScore,
        matchedSkills: JSON.stringify(analysis.matchedSkills),
        missingSkills: JSON.stringify(analysis.missingSkills),
        partialSkills: JSON.stringify(analysis.partialSkills),
        recommendations: JSON.stringify(analysis.recommendations),
        summary: analysis.summary,
        modelUsed: modelUsedStr,
      })
      .returning();
    return inserted[0];
  }
}
