import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getApplication } from "@/features/applications/actions/get-application"
import { ApplicationDetailView } from "@/features/applications/components/application-detail"

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const application = await getApplication(id)
    if (!application) return { title: "Not found" }
    return { title: `${application.role} at ${application.company} — JobTrackr` }
}

export default async function ApplicationPage({ params }: Props) {
    const { id } = await params
    const application = await getApplication(id)

    if (!application) notFound()

    return <ApplicationDetailView application={application} />
}