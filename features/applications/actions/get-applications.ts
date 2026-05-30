import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, applications } from "@/lib/db";
import type {
  ApplicationStatus,
  ApplicationsFilter,
  PaginatedApplications,
} from "../types";

const LIMIT = 20;

export async function getApplications(
  userId: string,
  filters: ApplicationsFilter = {},
): Promise<PaginatedApplications> {
  const { search, status, page = 1 } = filters;
  const offset = (page - 1) * LIMIT;

  // Build conditions array — always scoped to the current user
  const conditions = [eq(applications.userId, userId)];

  if (status && status !== "all") {
    conditions.push(eq(applications.status, status as ApplicationStatus));
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(applications.company, term),
        ilike(applications.role, term),
        ilike(applications.location, term),
      )!,
    );
  }

  const where = and(...conditions);

  // Run data fetch and count in parallel — single round trip to Neon
  const [rows, [{ total }]] = await Promise.all([
    db.query.applications.findMany({
      where,
      orderBy: [desc(applications.createdAt)],
      limit: LIMIT,
      offset,
    }),
    db.select({ total: count() }).from(applications).where(where),
  ]);

  return {
    data: rows,
    total: Number(total),
    page,
    pages: Math.ceil(Number(total) / LIMIT),
    limit: LIMIT,
  };
}
