import { NextRequest } from "next/server";
import { getQuestions } from "@/features/interview-prep/actions/get-questions";
import { saveAnswer } from "@/features/interview-prep/actions/save-answer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const questions = await getQuestions(applicationId);
    return Response.json(questions);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to fetch questions";
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    
    let body: { questionId?: string; userAnswer?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { questionId, userAnswer } = body;

    if (!questionId) {
      return Response.json({ error: "questionId is required" }, { status: 400 });
    }

    const updated = await saveAnswer(applicationId, questionId, userAnswer || "");
    return Response.json(updated);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to save answer";
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
