"use server";

import { db } from "@/lib/db";
import { interviewQuestions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export async function saveAnswer(applicationId: string, questionId: string, userAnswer: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const updated = await db
    .update(interviewQuestions)
    .set({
      userAnswer,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(interviewQuestions.id, questionId),
        eq(interviewQuestions.applicationId, applicationId),
        eq(interviewQuestions.userId, session.user.id)
      )
    )
    .returning();

  return updated[0] || null;
}
