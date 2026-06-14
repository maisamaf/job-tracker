import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { buildSimpleParseCvPrompt } from "@/features/profile/lib/prompt";
import { streamText } from "ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const payload =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};

    const cvText = typeof payload.cvText === "string" ? payload.cvText : undefined;
    const aiProvider = typeof payload.aiProvider === "string" ? payload.aiProvider : undefined;
    const aiModel = typeof payload.aiModel === "string" ? payload.aiModel : undefined;

    if (typeof cvText !== "string" || cvText.trim().length < 50) {
      return Response.json(
        {
          error:
            "cvText must be a non-empty string with at least 50 characters",
        },
        { status: 400 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { aiProvider: true, aiModel: true },
    });

    const model = getLanguageModel({
      provider: (aiProvider || user?.aiProvider) as AIProvider | undefined,
      modelName: aiModel || user?.aiModel || undefined,
    });

    const result = streamText({
      model,
      prompt: buildSimpleParseCvPrompt(cvText),
      temperature: 0,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[parse-cv] Error:", error);
    return Response.json(
      {
        error:
          "Failed to parse CV. The AI did not return valid JSON — try again or switch to a different model.",
      },
      { status: 500 },
    );
  }
}
