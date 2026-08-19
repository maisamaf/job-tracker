import { and, eq } from "drizzle-orm";
import { db, applications } from "@/lib/db";

export async function resolveOwnedApplicationId(
  applicationId: string | undefined,
  userId: string,
): Promise<string | null> {
  if (!applicationId) return null;

  const owned = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
    columns: { id: true },
  });

  return owned ? applicationId : null;
}
