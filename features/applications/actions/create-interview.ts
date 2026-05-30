"use server"

import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, interviews, applications } from "@/lib/db"
import { interviewSchema } from "../schemas"
import type { ActionState, InterviewInput } from "../schemas"

export async function createInterview(
    applicationId: string,
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState<InterviewInput>> {
    const session = await auth()
    if (!session?.user?.id) return { errors: { root: ["Unauthorised"] } }

    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, session.user.id)
        ),
        columns: { id: true },
    })
    if (!app) return { errors: { root: ["Application not found"] } }

    const parsed = interviewSchema.safeParse(Object.fromEntries(formData.entries()))
    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors as ActionState["errors"] }
    }

    await db.insert(interviews).values({
        applicationId,
        type: parsed.data.type,
        scheduledAt: parsed.data.scheduledAt ?? null,
        outcome: parsed.data.outcome,
        notes: parsed.data.notes || null,
    })

    revalidatePath(`/applications/${applicationId}`)
    return { success: true }
}