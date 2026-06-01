import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApplication } from "@/features/applications/actions/get-application";
import { ApplicationForm } from "@/features/applications/components/application-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) return { title: "Not found" };
  return {
    title: `Edit ${application.role} at ${application.company} — JobTrackr`,
  };
}

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) notFound();

  return <ApplicationForm initialData={application} />;
}
