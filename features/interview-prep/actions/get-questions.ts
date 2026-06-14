"use server";

import { db } from "@/lib/db";
import { interviewQuestions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export async function getQuestions(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await db.query.interviewQuestions.findMany({
    where: and(
      eq(interviewQuestions.applicationId, applicationId),
      eq(interviewQuestions.userId, session.user.id)
    ),
    orderBy: interviewQuestions.createdAt,
  });

  return result || [];
}
