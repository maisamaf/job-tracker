"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface UserSettingsInput {
  name?: string;
  aiProvider?: string | null;
  aiModel?: string | null;
  embeddingDimensions?: number | null;
}

export async function updateUserSettings(data: UserSettingsInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
