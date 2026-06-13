"use server";

import { db } from "@/lib/db";
import { jobPostings } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export async function getPosting(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const posting = await db.query.jobPostings.findFirst({
    where: and(
      eq(jobPostings.applicationId, applicationId),
      eq(jobPostings.userId, session.user.id)
    ),
  });

  return posting || null;
}
