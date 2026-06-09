import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCoverLetters } from "@/features/cover-letter/actions/get-cover-letters";
import { CoverLettersList } from "@/features/cover-letter/components/cover-letters-list";

export const metadata: Metadata = { title: "All Cover Letters — JobTrackr" };

const PAGE_LIMIT = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AllCoverLettersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const page = Math.max(1, Number(pageParam) || 1);
  const result = await getCoverLetters({ page, limit: PAGE_LIMIT });

  return <CoverLettersList result={result} />;
}
