import { count, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, coverLetters } from "@/lib/db";

export type SavedCoverLetter = {
  id: string;
  content: string;
  promptContext: string | null;
  model: string | null;
  createdAt: Date;
  application: { id: string; company: string; role: string } | null;
};

export interface PaginatedCoverLetters {
  data: SavedCoverLetter[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export async function getCoverLetters(
  options: { page?: number; limit?: number } = {},
): Promise<PaginatedCoverLetters> {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: [], total: 0, page, pages: 0, limit };
    }

    const where = eq(coverLetters.userId, session.user.id);

    const [rows, [{ total }]] = await Promise.all([
      db.query.coverLetters.findMany({
        where,
        with: {
          application: {
            columns: { id: true, company: true, role: true },
          },
        },
        orderBy: [desc(coverLetters.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(coverLetters).where(where),
    ]);

    const totalNum = Number(total);

    return {
      data: rows as SavedCoverLetter[],
      total: totalNum,
      page,
      pages: Math.ceil(totalNum / limit),
      limit,
    };
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    return { data: [], total: 0, page, pages: 0, limit };
  }
}
