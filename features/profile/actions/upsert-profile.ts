"use server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function upsertProfile(data: {
  cvRawText?: string;
  skills?: string[];
  experience?: object[];
  education?: object[];
  languages?: string[];
  summary?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (existing) {
    return db
      .update(userProfiles)
      .set({
        ...data,
        skills: data.skills ? JSON.stringify(data.skills) : existing.skills,
        experience: data.experience
          ? JSON.stringify(data.experience)
          : existing.experience,
        education: data.education
          ? JSON.stringify(data.education)
          : existing.education,
        languages: data.languages
          ? JSON.stringify(data.languages)
          : existing.languages,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id))
      .returning();
  }

  return db
    .insert(userProfiles)
    .values({
      userId: session.user.id,
      cvRawText: data.cvRawText,
      skills: data.skills ? JSON.stringify(data.skills) : null,
      experience: data.experience ? JSON.stringify(data.experience) : null,
      education: data.education ? JSON.stringify(data.education) : null,
      languages: data.languages ? JSON.stringify(data.languages) : null,
      summary: data.summary,
    })
    .returning();
}
