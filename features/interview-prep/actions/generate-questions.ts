"use server";

import { db } from "@/lib/db";
import { interviewQuestions, userProfiles, jobPostings, users, applications } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { generateJsonObject } from "@/lib/ai/generate-json-object";
import { buildInterviewPrepPrompt } from "../lib/prompt";
import { generatedQuestionsListSchema } from "../types";
import { eq, and } from "drizzle-orm";

export async function generateQuestions(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch application info
  const app = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, applicationId),
      eq(applications.userId, session.user.id)
    ),
  });

  if (!app) {
    throw new Error("Application not found");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (!profile) {
    throw new Error("Complete your profile first");
  }

  // 3. Fetch job posting requirements (optional, fallback if not ready)
  const posting = await db.query.jobPostings.findFirst({
    where: eq(jobPostings.applicationId, applicationId),
  });

  const jobRequiredSkills = posting?.requiredSkills ? JSON.parse(posting.requiredSkills) : [];

  const candidateSkills = profile.skills ? JSON.parse(profile.skills) : [];
  const candidateExperience = profile.experience ? JSON.parse(profile.experience) : [];

  // 4. Resolve AI Model
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { aiProvider: true, aiModel: true },
  });

  const model = getLanguageModel({
    provider: user?.aiProvider as AIProvider | undefined,
    modelName: user?.aiModel ?? undefined,
  });

  // 5. Build prompt
  const prompt = buildInterviewPrepPrompt({
    role: app.role,
    company: app.company,
    requiredSkills: jobRequiredSkills,
    candidate: {
      skills: candidateSkills,
      experience: candidateExperience,
    },
  });

  // 6. Call AI
  const questions = await generateJsonObject({
    model,
    schema: generatedQuestionsListSchema,
    prompt,
    maxAttempts: 3,
  });

  // 7. Delete existing generated questions (if any) and insert new ones
  // neon-http does not support transactions — use sequential plain queries instead
  await db
    .delete(interviewQuestions)
    .where(
      and(
        eq(interviewQuestions.applicationId, applicationId),
        eq(interviewQuestions.userId, session.user.id)
      )
    );

  if (questions.length > 0) {
    await db.insert(interviewQuestions).values(
      questions.map((q) => ({
        applicationId,
        userId: session.user.id,
        category: q.category,
        question: q.question,
        suggestedAnswer: q.suggestedAnswer,
        difficulty: q.difficulty,
      }))
    );
  }

  // 8. Return newly generated list
  return db.query.interviewQuestions.findMany({
    where: and(
      eq(interviewQuestions.applicationId, applicationId),
      eq(interviewQuestions.userId, session.user.id)
    ),
    orderBy: interviewQuestions.createdAt,
  });
}
