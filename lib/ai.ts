import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Polyfill TextDecoderStream for older Bun runtimes (e.g. Bun v1.0.x)
if (typeof globalThis.TextDecoderStream === "undefined") {
  class TextDecoderStream extends TransformStream<BufferSource, string> {
    constructor(encoding = "utf-8", options?: TextDecoderOptions) {
      const decoder = options
        ? new TextDecoder(encoding, options)
        : new TextDecoder(encoding);
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
  globalThis.TextDecoderStream =
    TextDecoderStream as unknown as typeof globalThis.TextDecoderStream;
}

// AI providers
export enum AIProvider {
  ANTHROPIC = "anthropic",
  OPENAI = "openai",
  OPENWEB = "openweb",
  GEMINI = "gemini",
}

// Auto-detect which provider to use based on env vars.
function detectDefaultProvider(): AIProvider {
  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER as AIProvider;
  }
  if (process.env.GEMINI_API_KEY) return AIProvider.GEMINI;
  if (process.env.ANTHROPIC_API_KEY) return AIProvider.ANTHROPIC;
  if (process.env.OPENAI_API_KEY) return AIProvider.OPENAI;
  if (process.env.OPENWEB_API_KEY) return AIProvider.OPENWEB;
  // Fallback — will fail gracefully with a missing-key error at request time
  return AIProvider.ANTHROPIC;
}

// Default models (used when AI_MODEL is not set)
const PROVIDER_DEFAULT_MODELS: Record<AIProvider, string> = {
  [AIProvider.ANTHROPIC]: "claude-3-5-sonnet-20241022",
  [AIProvider.OPENAI]: "gpt-4o",
  [AIProvider.GEMINI]: "gemini-flash-latest",
  [AIProvider.OPENWEB]: "efficient-language-model",
};

export const DEFAULT_PROVIDER = detectDefaultProvider();
export const DEFAULT_MODEL =
  process.env.AI_MODEL || PROVIDER_DEFAULT_MODELS[DEFAULT_PROVIDER];

// Initialize providers
export const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Open Web API: OpenAI-compatible local or custom endpoints (Open WebUI, Ollama, OpenRouter, …)
export const openwebProvider = createOpenAI({
  baseURL: process.env.OPENWEB_API_BASE_URL || "http://localhost:3000/api/v1",
  apiKey: process.env.OPENWEB_API_KEY || "",
  compatibility: "compatible",
} as Parameters<typeof createOpenAI>[0] & {
  compatibility: "strict" | "compatible";
});

export const geminiProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

interface ResolveModelOptions {
  provider?: AIProvider;
  modelName?: string;
}

export function getLanguageModel({
  provider,
  modelName,
}: ResolveModelOptions = {}) {
  const selectedProvider = provider || DEFAULT_PROVIDER;
  const selectedModel =
    modelName ||
    process.env.AI_MODEL ||
    PROVIDER_DEFAULT_MODELS[selectedProvider] ||
    DEFAULT_MODEL;

  switch (selectedProvider) {
    case AIProvider.ANTHROPIC:
      return anthropicProvider(selectedModel);
    case AIProvider.OPENAI:
      return openaiProvider(selectedModel);
    case AIProvider.OPENWEB:
      return openwebProvider.chat(selectedModel);
    case AIProvider.GEMINI:
      return geminiProvider(selectedModel);
    default:
      throw new Error(`Unsupported AI provider: ${selectedProvider}`);
  }
}
