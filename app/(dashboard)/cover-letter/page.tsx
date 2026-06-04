import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, applications } from "@/lib/db";
import { getCoverLetters } from "@/features/cover-letter/actions/get-cover-letters";
import { CoverLetterGenerator } from "@/features/cover-letter/components/cover-letter-generator";
import { SavedLetters } from "@/features/cover-letter/components/saved-letters";

export const metadata: Metadata = { title: "Cover Letter — JobTrackr" };

interface Props {
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function CoverLetterPage({ searchParams }: Props) {
  const { applicationId } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch user's applications for the picker + saved letters in parallel
  const [userApplications, savedLetters] = await Promise.all([
    db.query.applications.findMany({
      where: eq(applications.userId, session.user.id),
      columns: {
        id: true,
        company: true,
        role: true,
        description: true,
      },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    }),
    getCoverLetters(),
  ]);

  return (
    <div className="pb-16">
      <CoverLetterGenerator
        applications={userApplications}
        defaultApplicationId={applicationId}
      />
      <SavedLetters letters={savedLetters} />
    </div>
  );
}
