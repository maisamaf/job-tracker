"use server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });
}
