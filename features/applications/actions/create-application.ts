"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import { CreateApplicationInput, createApplicationSchema, type ActionState } from "../schemas";

export async function createApplication(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState<CreateApplicationInput>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { errors: { root: ["You must be signed in"] } };
  }

  // Pull raw values to echo back on validation failure
  const rawValues = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;

  const parsed = createApplicationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as ActionState["errors"],
      values: rawValues,
    };
  }

  const data = parsed.data;

  const [application] = await db
    .insert(applications)
    .values({
      userId: session.user.id,
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
    })
    .returning({ id: applications.id });

  redirect(`/applications/${application.id}`);
}
