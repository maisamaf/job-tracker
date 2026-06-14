import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { generateQuestions } from "@/features/interview-prep/actions/generate-questions";

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

    const result = await generateQuestions(applicationId);
    return Response.json(result);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to generate questions";
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}