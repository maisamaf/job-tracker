"use server";

import { auth } from "@/auth";
import { db, coverLetters } from "@/lib/db";

interface SaveCoverLetterArgs {
  applicationId?: string;
  content: string;
  promptContext: string;
  modelUsed: string;
}

export async function saveCoverLetter({
  applicationId,
  content,
  promptContext,
  modelUsed,
}: SaveCoverLetterArgs) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorised" };

  const [saved] = await db
    .insert(coverLetters)
    .values({
      userId: session.user.id,
      applicationId: applicationId ?? null,
      content,
      promptContext,
      model: modelUsed,
    })
    .returning({ id: coverLetters.id });

  return { id: saved.id };
}
