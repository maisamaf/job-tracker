import { desc, eq } from "drizzle-orm";
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

export async function getCoverLetters(): Promise<SavedCoverLetter[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const rows = await db.query.coverLetters.findMany({
      where: eq(coverLetters.userId, session.user.id),
      with: {
        application: {
          columns: { id: true, company: true, role: true },
        },
      },
      orderBy: [desc(coverLetters.createdAt)],
      limit: 50,
    });

    return rows as SavedCoverLetter[];
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    return [];
  }
}
