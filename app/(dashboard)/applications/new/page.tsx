import type { Metadata } from "next"
import { ApplicationForm } from "@/features/applications/components/application-form"

export const metadata: Metadata = {
  title: "Add Application — JobTrackr",
}

export default function NewApplicationPage() {
  return <ApplicationForm />
}