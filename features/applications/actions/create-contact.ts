"use server"

import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, contacts, applications } from "@/lib/db"
import { contactSchema } from "../schemas"
import type { ActionState, ContactInput } from "../schemas"

export async function createContact(
    applicationId: string,
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState<ContactInput>> {
    const session = await auth()
    if (!session?.user?.id) return { errors: { root: ["Unauthorised"] } }

    // Verify this application belongs to the user before inserting
    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, session.user.id)
        ),
        columns: { id: true },
    })
    if (!app) return { errors: { root: ["Application not found"] } }

    const parsed = contactSchema.safeParse(Object.fromEntries(formData.entries()))
    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors as ActionState["errors"] }
    }

    await db.insert(contacts).values({
        applicationId,
        name: parsed.data.name,
        role: parsed.data.role || null,
        email: parsed.data.email || null,
        linkedinUrl: parsed.data.linkedinUrl || null,
        notes: parsed.data.notes || null,
    })

    revalidatePath(`/applications/${applicationId}`)
    return { success: true }
}