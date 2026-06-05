import { eq, and } from "drizzle-orm"
import { db, applications, contacts, interviews, activityLog, coverLetters } from "@/lib/db"
import { auth } from "@/auth"

export async function getApplication(id: string) {
    const session = await auth()
    if (!session?.user?.id) return null

    const application = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, id),
            eq(applications.userId, session.user.id) // never expose other users' data
        ),
        with: {
            contacts: true,
            interviews: {
                orderBy: (interviews, { desc }) => [desc(interviews.scheduledAt)],
            },
            activityLog: {
                orderBy: (log, { desc }) => [desc(log.updatedAt)],
            },
            coverLetters: {
                orderBy: (cl, { desc }) => [desc(cl.createdAt)],
            },
        },
    })

    return application ?? null
}

export type ApplicationDetail = NonNullable<Awaited<ReturnType<typeof getApplication>>>