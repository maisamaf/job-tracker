"use server"

import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, applications, activityLog } from "@/lib/db"
import { updateStatusSchema } from "../schemas"
import type { ActionState } from "../schemas"
import type { ApplicationStatus } from "../types"

export async function updateStatus(
    id: string,
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth()
    if (!session?.user?.id) return { errors: { root: ["Unauthorised"] } }

    const parsed = updateStatusSchema.safeParse({
        status: formData.get("status"),
    })
    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors as ActionState["errors"] }
    }

    // Fetch current status to log the change
    const current = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, id),
            eq(applications.userId, session.user.id)
        ),
        columns: { status: true },
    })

    if (!current) return { errors: { root: ["Application not found"] } }
    if (current.status === parsed.data.status) return { success: true }

    // Update + log in parallel
    await Promise.all([
        db
            .update(applications)
            .set({ status: parsed.data.status, updatedAt: new Date() })
            .where(
                and(
                    eq(applications.id, id),
                    eq(applications.userId, session.user.id)
                )
            ),
        db.insert(activityLog).values({
            applicationId: id,
            fieldChanged: "status",
            oldValue: current.status,
            newValue: parsed.data.status,
        }),
    ])

    revalidatePath(`/applications/${id}`)
    revalidatePath("/applications")
    return { success: true }
}