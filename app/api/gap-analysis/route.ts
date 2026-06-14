import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { runGapAnalysis } from "@/features/gap-analysis/actions/run-gap-analysis";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { applicationId?: string };
    try {
       body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { applicationId } = body;

    if (!applicationId) {
      return Response.json({ error: "applicationId is required" }, { status: 400 });
    }

    const result = await runGapAnalysis(applicationId);
    return Response.json(result);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to run gap analysis";
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}