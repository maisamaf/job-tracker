import {
  generateObject,
  generateText,
  NoObjectGeneratedError,
  type LanguageModel,
} from "ai";
import type { z } from "zod";

import {
  buildJsonRetryPrompt,
  extractJsonFromText,
} from "@/lib/ai/json";

interface GenerateJsonObjectOptions<T extends z.ZodType> {
  model: LanguageModel;
  schema: T;
  prompt: string;
  maxAttempts?: number;
}

function parseAndValidate<T extends z.ZodType>(
  schema: T,
  raw: string,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(extractJsonFromText(raw));
    const result = schema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error.message };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Response is not valid JSON",
    };
  }
}

/**
 * Generates structured data from an LLM with automatic repair and retry.
 *
 * 1. Tries `generateObject` (works with providers that support JSON schema / tools)
 * 2. Uses `experimental_repairText` to ask the model to fix invalid JSON inline
 * 3. Falls back to explicit regeneration prompts when parsing still fails
 */
export async function generateJsonObject<T extends z.ZodType>({
  model,
  schema,
  prompt,
  maxAttempts = 3,
}: GenerateJsonObjectOptions<T>): Promise<z.infer<T>> {
  let lastInvalidText = "";
  let lastError = "Unknown parsing error";
  let useTextFallbackOnly = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptPrompt =
      attempt === 1
        ? `${prompt}

CRITICAL: Respond with ONLY a single valid JSON object. Do not use markdown, headings, bullet lists, or code fences.`
        : buildJsonRetryPrompt(prompt, lastInvalidText, lastError);

    if (!useTextFallbackOnly) {
      try {
        const { object } = await generateObject({
          model,
          schema,
          prompt: attemptPrompt,
          temperature: 0,
          experimental_repairText: async ({ text, error }) => {
            const { text: repaired } = await generateText({
              model,
              temperature: 0,
              prompt: `Convert the following into valid JSON only. Fix all syntax and formatting errors.

Schema validation error: ${error.message}

Invalid output:
${text}

Return ONLY the corrected JSON object. No markdown, no explanation.`,
            });

            return extractJsonFromText(repaired);
          },
        });

        // generateObject validates the response internally. If it succeeds, the object is valid.
        return object as z.infer<T>;
      } catch (error) {
        // Detect structured-output lack of support from providers
        const errMsg = error instanceof Error ? error.message.toLowerCase() : "";
        if (
          errMsg.includes("not supported") ||
          errMsg.includes("bad request") ||
          errMsg.includes("invalid provider") ||
          errMsg.includes("400")
        ) {
          useTextFallbackOnly = true;
        }

        if (error instanceof NoObjectGeneratedError && error.text) {
          lastInvalidText = error.text;

          const recovered = parseAndValidate(schema, error.text);
          if (recovered.success) {
            return recovered.data;
          }

          lastError = recovered.error;
        } else if (error instanceof Error) {
          lastError = error.message;
        }

        if (attempt >= maxAttempts) {
          throw error;
        }
      }
    }

    // Explicit regeneration when generateObject fails entirely (common on self-hosted models)
    const { text } = await generateText({
      model,
      temperature: 0,
      prompt: buildJsonRetryPrompt(prompt, lastInvalidText, lastError),
    });

    const recovered = parseAndValidate(schema, text);
    if (recovered.success) {
      return recovered.data;
    }

    lastInvalidText = text;
    lastError = recovered.error;
  }

  throw new Error(
    `Failed to generate valid JSON after ${maxAttempts} attempts: ${lastError}`,
  );
}
