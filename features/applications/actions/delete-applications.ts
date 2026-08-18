"use server"

import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, applications } from "@/lib/db"

export async function deleteApplications(ids: string[]) {
    const session = await auth()
    if (!session?.user?.id) return { success: false as const, error: "Unauthorised" }
    if (ids.length === 0) return { success: false as const, error: "No applications selected" }

    await db
        .delete(applications)
        .where(
            and(inArray(applications.id, ids), eq(applications.userId, session.user.id))
        )

    revalidatePath("/applications")
    return { success: true as const }
}
