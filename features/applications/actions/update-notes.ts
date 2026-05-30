"use server"

import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, applications } from "@/lib/db"
import { updateNotesSchema } from "../schemas"
import type { ActionState } from "../schemas"

export async function updateNotes(
    id: string,
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth()
    if (!session?.user?.id) return { errors: { root: ["Unauthorised"] } }

    const parsed = updateNotesSchema.safeParse({ notes: formData.get("notes") })
    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors as ActionState["errors"] }
    }

    await db
        .update(applications)
        .set({ notes: parsed.data.notes ?? null, updatedAt: new Date() })
        .where(
            and(
                eq(applications.id, id),
                eq(applications.userId, session.user.id)
            )
        )

    revalidatePath(`/applications/${id}`)
    return { success: true }
}