"use server";

import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, applications, activityLog } from "@/lib/db";
import { createApplicationSchema } from "../schemas";
import type { ActionState, CreateApplicationInput } from "../schemas";

export async function updateApplication(
  id: string,
  _prevState: ActionState<CreateApplicationInput>,
  formData: FormData,
): Promise<ActionState<CreateApplicationInput>> {
  const session = await auth();
  if (!session?.user?.id) return { errors: { root: ["Unauthorised"] } };

  const rawValues = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;
  const parsed = createApplicationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten()
        .fieldErrors as ActionState<CreateApplicationInput>["errors"],
      values: rawValues,
    };
  }

  // Fetch current to diff status for activity log
  const current = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, id),
      eq(applications.userId, session.user.id),
    ),
    columns: { status: true },
  });

  if (!current) return { errors: { root: ["Application not found"] } };

  const data = parsed.data;

  const updates: typeof data & { updatedAt: Date } = {
    ...data,
    updatedAt: new Date(),
  };

  const promises: Promise<unknown>[] = [
    db
      .update(applications)
      .set({
        company: data.company,
        role: data.role,
        status: data.status,
        location: data.location || null,
        jobUrl: data.jobUrl || null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        description: data.description || null,
        notes: data.notes || null,
        appliedAt: data.appliedAt ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(applications.id, id), eq(applications.userId, session.user.id)),
      ),
  ];

  // Log status change if it changed
  if (current.status !== data.status) {
    promises.push(
      db.insert(activityLog).values({
        applicationId: id,
        fieldChanged: "status",
        oldValue: current.status,
        newValue: data.status,
      }),
    );
  }

  await Promise.all(promises);

  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  redirect(`/applications/${id}`);
}
