"use server"

import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, coverLetters } from "@/lib/db"

export async function deleteCoverLetters(ids: string[]) {
    const session = await auth()
    if (!session?.user?.id) return { success: false as const, error: "Unauthorised" }
    if (ids.length === 0) return { success: false as const, error: "No cover letters selected" }

    await db
        .delete(coverLetters)
        .where(
            and(inArray(coverLetters.id, ids), eq(coverLetters.userId, session.user.id))
        )

    revalidatePath("/cover-letter")
    revalidatePath("/cover-letter/all")
    return { success: true as const }
}
