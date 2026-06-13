export interface AIProviderConfig {
  value: string;
  label: string;
  description: string;
}

export interface AIModelConfig {
  value: string;
  label: string;
  description: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Claude models — state-of-the-art reasoning & analysis",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT models — widely supported & versatile",
  },
  {
    value: "gemini",
    label: "Google Gemini",
    description: "Gemini models — fast & cost-effective",
  },
  {
    value: "openweb",
    label: "Custom / Self-hosted",
    description:
      "OpenAI-compatible endpoint (Open WebUI, Ollama, OpenRouter)",
  },
];

export const MODELS_BY_PROVIDER: Record<string, AIModelConfig[]> = {
  anthropic: [
    {
      value: "claude-opus-4-5",
      label: "Claude Opus 4.5",
      description: "Most powerful",
    },
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude Sonnet 3.5",
      description: "Best balance of speed & intelligence",
    },
    {
      value: "claude-3-5-haiku-20241022",
      label: "Claude Haiku 3.5",
      description: "Fastest & most cost-efficient",
    },
  ],
  openai: [
    {
      value: "gpt-4o",
      label: "GPT-4o",
      description: "Most capable multimodal model",
    },
    {
      value: "gpt-4o-mini",
      label: "GPT-4o Mini",
      description: "Fast & cost-efficient",
    },
    {
      value: "gpt-4-turbo",
      label: "GPT-4 Turbo",
      description: "High capability, large context",
    },
  ],
  gemini: [
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      description: "Latest generation, very fast",
    },
    {
      value: "gemini-1.5-pro",
      label: "Gemini 1.5 Pro",
      description: "Long context window, high quality",
    },
    {
      value: "gemini-flash-latest",
      label: "Gemini Flash Latest",
      description: "Fastest Gemini model",
    },
  ],
  openweb: [],
};
