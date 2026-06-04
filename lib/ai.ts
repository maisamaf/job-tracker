import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

// Polyfill TextDecoderStream for older Bun runtimes (e.g. Bun v1.0.x)
if (typeof globalThis.TextDecoderStream === "undefined") {
  class TextDecoderStream extends TransformStream<BufferSource, string> {
    constructor(encoding = "utf-8", options?: TextDecoderOptions) {
      const decoder = options ? new TextDecoder(encoding, options) : new TextDecoder(encoding);
      super({
        transform(chunk, controller) {
          controller.enqueue(decoder.decode(chunk, { stream: true }));
        },
        flush(controller) {
          controller.enqueue(decoder.decode());
        },
      });
    }
  }
  globalThis.TextDecoderStream = TextDecoderStream as BufferSource;
}

// AI providers
export type AIProvider = "anthropic" | "openai" | "openweb";

// Default settings
const DEFAULT_PROVIDER = (process.env.AI_PROVIDER as AIProvider) || "anthropic";
const DEFAULT_MODEL = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";

// 3. Initialize Provider Clients
// Anthropic (Claude)
export const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});
// OpenAI
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
// "Open Web API" (OpenAI-compatible local or custom endpoints)
export const openwebProvider = createOpenAI({
  baseURL: process.env.OPENWEB_API_BASE_URL || "http://localhost:3000/api/v1",
  apiKey: process.env.OPENWEB_API_KEY || "",
  compatibility: "compatible", // enforce compatibility mode for non-OpenAI endpoints

});
interface ResolveModelOptions {
  provider?: AIProvider;
  modelName?: string;
}


export function getLanguageModel({ provider, modelName }: ResolveModelOptions = {}) {
  const selectedProvider = provider || DEFAULT_PROVIDER;
  const selectedModel = modelName || DEFAULT_MODEL;
  switch (selectedProvider) {
    case "anthropic":
      return anthropicProvider(selectedModel);
    case "openai":
      return openaiProvider(selectedModel);
    case "openweb":
      return openwebProvider.chat(selectedModel);
    default:
      throw new Error(`Unsupported AI provider: ${selectedProvider}`);
  }
}
