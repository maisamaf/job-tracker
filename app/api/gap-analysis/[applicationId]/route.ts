import { NextRequest } from "next/server";
import { getGapAnalysis } from "@/features/gap-analysis/actions/get-gap-analysis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const analysis = await getGapAnalysis(applicationId);
    return Response.json(analysis);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to fetch gap analysis";
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
