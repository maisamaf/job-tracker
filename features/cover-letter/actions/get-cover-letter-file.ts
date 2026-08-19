import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, coverLetters } from "@/lib/db";

export async function getCoverLetterFile(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const letter = await db.query.coverLetters.findFirst({
    where: and(eq(coverLetters.id, id), eq(coverLetters.userId, session.user.id)),
    columns: { fileData: true, fileName: true, fileMimeType: true },
  });

  if (!letter?.fileData || !letter.fileName) return null;

  return {
    data: letter.fileData,
    fileName: letter.fileName,
    mimeType: letter.fileMimeType || "application/octet-stream",
  };
}
