import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import type { Application } from "@/lib/db";

export type DashboardStats = {
  total: number;
  active: number;
  awaitingResponse: number;
  interviewing: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recentApplications: Application[];
  userName: string | null;
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [all, recent] = await Promise.all([
    db
      .select({ status: applications.status })
      .from(applications)
      .where(eq(applications.userId, userId)),

    db.query.applications.findMany({
      where: eq(applications.userId, userId),
      orderBy: [desc(applications.updatedAt)],
      limit: 6,
    }),
  ]);

  const stats: DashboardStats = {
    total: all.length,
    active: all.filter(
      (a) => a.status !== "rejected" && a.status !== "withdrawn",
    ).length,
    awaitingResponse: all.filter((a) => a.status === "applied").length,
    interviewing: all.filter((a) => a.status === "interviewing").length,
  };

  return {
    stats,
    recentApplications: recent,
    userName: session.user.name ?? null,
  };
}
