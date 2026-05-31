import { ApplicationHeader } from "./application-header"
import { NotesSection } from "./notes-section"
import { ContactsSection } from "./contacts-section"
import { InterviewsSection } from "./interviews-section"
import { ActivitySection } from "./activity-section"
import type { ApplicationDetail } from "../actions/get-application"

interface ApplicationDetailProps {
    application: ApplicationDetail
}

export function ApplicationDetailView({ application }: ApplicationDetailProps) {
    return (
        <div className="mx-auto max-w-4xl pb-16">
            <ApplicationHeader application={application} />

            {/* Two-column layout on large screens */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* Left column — main content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <ContactsSection
                        applicationId={application.id}
                        contacts={application.contacts}
                    />
                    <InterviewsSection
                        applicationId={application.id}
                        interviews={application.interviews}
                    />
                    {/* Job description — read only */}
                    {application.description && (
                        <section>
                            <h2 className="text-sm font-semibold mb-3">Job description</h2>
                            <div className="rounded-lg border bg-muted/10 px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                                {application.description}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right column — sidebar */}
                <div className="flex flex-col gap-8">
                    <NotesSection
                        applicationId={application.id}
                        initialNotes={application.notes}
                    />
                    <ActivitySection log={application.activityLog} />
                </div>
            </div>
        </div>
    )
}