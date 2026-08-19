"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, coverLetters } from "@/lib/db";
import { resolveOwnedApplicationId } from "../lib/resolve-owned-application";

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

  const ownedApplicationId = await resolveOwnedApplicationId(
    applicationId,
    session.user.id,
  );

  const [saved] = await db
    .insert(coverLetters)
    .values({
      userId: session.user.id,
      applicationId: ownedApplicationId,
      content,
      promptContext,
      model: modelUsed,
    })
    .returning({ id: coverLetters.id });

  revalidatePath("/cover-letter");
  revalidatePath("/cover-letter/all");

  return { id: saved.id };
}
