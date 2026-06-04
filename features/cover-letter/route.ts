import { streamText } from "ai";
import { auth } from "@/auth";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { buildCoverLetterPrompt } from "@/features/cover-letter/lib/prompt";
import {TONE_OPTIONS} from "@/features/cover-letter/types";
import { z } from "zod";

const requestSchema = z.object({
  jobDescription: z.string().min(20, "Job description too short"),
  background: z.string().min(20, "Background too short"),
  tone: z.enum(TONE_OPTIONS),
  additionalContext: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),

  // Accept optional provider and model overrides from the client
  aiProvider: z.enum(AIProvider).optional(),
  aiModel: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorised", { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { aiProvider, aiModel, background, ...promptData } = parsed.data;
  const prompt = buildCoverLetterPrompt({
    ...promptData,
    yourBackground: background,
  });

  try {
    // Resolve model dynamically using the Factory Pattern
    const model = getLanguageModel({
      provider: aiProvider,
      modelName: aiModel,
    });

    const result = streamText({
      model,
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    const { message, status } = getFriendlyAIError(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}

function getFriendlyAIError(error: unknown): { message: string; status: number } {
  let status = 500;
  let message = "An unexpected error occurred while generating the cover letter.";

  if (error instanceof Error) {
    message = error.message;
    const errObj = error as { status?: number; statusCode?: number };
    if (typeof errObj.status === "number") {
      status = errObj.status;
    } else if (typeof errObj.statusCode === "number") {
      status = errObj.statusCode;
    }
  } else if (error && typeof error === "object") {
    const errObj = error as { message?: string; status?: number; statusCode?: number };
    if (typeof errObj.message === "string") {
      message = errObj.message;
    }
    if (typeof errObj.status === "number") {
      status = errObj.status;
    } else if (typeof errObj.statusCode === "number") {
      status = errObj.statusCode;
    }
  }

  const msg = message.toLowerCase();

  // 1. Session or Auth errors
  if (status === 401 || msg.includes("api key") || msg.includes("unauthorized") || msg.includes("auth")) {
    return {
      message: "AI provider authorization failed. Please check that the API keys are configured correctly.",
      status: 401,
    };
  }

  // 2. Rate limit / Quota errors
  if (status === 429 || msg.includes("rate limit") || msg.includes("quota") || msg.includes("too many requests") || msg.includes("exceeded your current quota")) {
    return {
      message: "AI token limit or rate limit exceeded. Please try again in a few minutes.",
      status: 429,
    };
  }

  // 3. Token context / input limit errors
  if (msg.includes("context length") || msg.includes("token limit") || msg.includes("max tokens") || msg.includes("too long") || msg.includes("maximum context length")) {
    return {
      message: "The job description or background is too long and exceeds the model's token limit. Please shorten your input.",
      status: 400,
    };
  }

  // 4. Default error
  return {
    message,
    status,
  };
}

