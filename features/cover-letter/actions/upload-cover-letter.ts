"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, coverLetters } from "@/lib/db";
import {
  ALLOWED_COVER_LETTER_MIME_TYPES,
  MAX_COVER_LETTER_FILE_SIZE,
} from "../lib/upload-constraints";
import { resolveOwnedApplicationId } from "../lib/resolve-owned-application";

export async function uploadCoverLetter(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorised" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided" };
  }
  if (!ALLOWED_COVER_LETTER_MIME_TYPES.has(file.type)) {
    return { error: "Only PDF and Word documents (.pdf, .doc, .docx) are supported" };
  }
  if (file.size > MAX_COVER_LETTER_FILE_SIZE) {
    return { error: "File is too large (max 5MB)" };
  }

  const applicationIdRaw = formData.get("applicationId");
  const applicationId =
    typeof applicationIdRaw === "string" && applicationIdRaw !== "none"
      ? applicationIdRaw
      : undefined;
  const ownedApplicationId = await resolveOwnedApplicationId(
    applicationId,
    session.user.id,
  );

  const buffer = Buffer.from(await file.arrayBuffer());

  const [saved] = await db
    .insert(coverLetters)
    .values({
      userId: session.user.id,
      applicationId: ownedApplicationId,
      fileName: file.name,
      fileMimeType: file.type,
      fileSize: file.size,
      fileData: buffer,
      promptContext: JSON.stringify({ source: "upload" }),
      model: "upload",
    })
    .returning({ id: coverLetters.id });

  revalidatePath("/cover-letter");
  revalidatePath("/cover-letter/all");

  return { id: saved.id };
}
