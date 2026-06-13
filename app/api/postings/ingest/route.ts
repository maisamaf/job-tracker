import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { ingestPosting } from "@/features/job-intel/actions/ingest-posting";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { applicationId?: string; url?: string; fallbackText?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { applicationId, url, fallbackText } = body;

    if (!applicationId) {
      return Response.json({ error: "applicationId is required" }, { status: 400 });
    }

    const result = await ingestPosting(applicationId, url, fallbackText);
    return Response.json(result);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to ingest posting";
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}