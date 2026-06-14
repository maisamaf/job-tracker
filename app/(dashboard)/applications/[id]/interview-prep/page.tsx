import { InterviewPrepView } from "@/features/interview-prep/components/category-tabs";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterviewPrepPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-5xl pb-16 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="size-4" />
          Back to Application
        </Link>
      </div>
      <InterviewPrepView applicationId={id} />
    </div>
  );
}