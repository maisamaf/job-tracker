import { and, desc, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { db, activityLog, applications } from "@/lib/db";

export type ActivityEntry = {
  id: string;
  applicationId: string | null;
  company: string;
  role: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  updatedAt: Date;
};

export type ActivityFilter = "7d" | "30d" | "90d" | "all";

export async function getActivity(
  filter: ActivityFilter = "30d",
): Promise<ActivityEntry[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const cutoffs: Record<ActivityFilter, Date | null> = {
    "7d": new Date(Date.now() - 7 * 86400_000),
    "30d": new Date(Date.now() - 30 * 86400_000),
    "90d": new Date(Date.now() - 90 * 86400_000),
    all: null,
  };

  const cutoff = cutoffs[filter];

  const conditions = [eq(applications.userId, session.user.id)];
  if (cutoff) conditions.push(gte(activityLog.updatedAt, cutoff));

  return db
    .select({
      id: activityLog.id,
      applicationId: activityLog.applicationId,
      company: applications.company,
      role: applications.role,
      fieldChanged: activityLog.fieldChanged,
      oldValue: activityLog.oldValue,
      newValue: activityLog.newValue,
      updatedAt: activityLog.updatedAt,
    })
    .from(activityLog)
    .innerJoin(applications, eq(activityLog.applicationId, applications.id))
    .where(and(...conditions))
    .orderBy(desc(activityLog.updatedAt))
    .limit(200);
}
