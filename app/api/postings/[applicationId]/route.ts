import { NextRequest } from "next/server";
import { getPosting } from "@/features/job-intel/actions/get-posting";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const posting = await getPosting(applicationId);
    return Response.json(posting);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to fetch posting";
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
