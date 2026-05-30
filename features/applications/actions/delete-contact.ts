"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, contacts } from "@/lib/db"

export async function deleteContact(contactId: string, applicationId: string) {
    const session = await auth()
    if (!session?.user?.id) return

    // Verify ownership via the parent application
    const contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, contactId),
        with: { application: { columns: { userId: true } } },
    })

    if (contact?.application?.userId !== session.user.id) return

    await db.delete(contacts).where(eq(contacts.id, contactId))

    revalidatePath(`/applications/${applicationId}`)
}