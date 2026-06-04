import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import { STATUS_OPTIONS, type ApplicationStatus } from "../../applications/types";
import type { Application } from "@/lib/db";

export type BoardData = Record<ApplicationStatus, Application[]>;

export async function getBoardApplications(): Promise<BoardData> {
  const session = await auth();
  if (!session?.user?.id) return {} as BoardData;

  const rows = await db.query.applications.findMany({
    where: eq(applications.userId, session.user.id),
    orderBy: (applications, { asc }) => [asc(applications.createdAt)],
  });

  // Group by status
  const board = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = [];
    return acc;
  }, {} as BoardData);

  for (const app of rows) {
    board[app.status].push(app);
  }

  return board;
}
