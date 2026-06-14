"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateUserSettings } from "@/features/settings/actions/update-user-settings";
import {
  AI_PROVIDERS,
  MODELS_BY_PROVIDER,
} from "@/features/settings/lib/ai-config";

// ─── Helpers 

function resolveInitialProvider(aiProvider: string | null): string {
  if (aiProvider && AI_PROVIDERS.some((p) => p.value === aiProvider)) {
    return aiProvider;
  }
  return AI_PROVIDERS[0].value;
}

function resolveInitialModel(provider: string, aiModel: string | null): string {
  const models = MODELS_BY_PROVIDER[provider] ?? [];
  if (models.length === 0) return "";
  if (aiModel && models.some((m) => m.value === aiModel)) return aiModel;
  return models[0].value;
}

interface AiSettingsFormProps {
  user: {
    aiProvider: string | null;
    aiModel: string | null;
    embeddingDimensions: number | null;
  };
}

export function AiSettingsForm({ user }: AiSettingsFormProps) {
  const [selectedProvider, setSelectedProvider] = useState(() =>
    resolveInitialProvider(user.aiProvider),
  );
  const [selectedModel, setSelectedModel] = useState(() =>
    resolveInitialModel(resolveInitialProvider(user.aiProvider), user.aiModel),
  );
  const [embeddingDimensions, setEmbeddingDimensions] = useState(() =>
    user.embeddingDimensions ?? (user.aiProvider === "openai" ? 1536 : 1024),
  );
  const [aiSaved, setAiSaved] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPending, startAiTransition] = useTransition();

  function handleProviderChange(providerValue: string) {
    setSelectedProvider(providerValue);
    const models = MODELS_BY_PROVIDER[providerValue] ?? [];
    setSelectedModel(models.length > 0 ? models[0].value : "");
    if (providerValue === "openai") {
      setEmbeddingDimensions(1536);
    } else {
      setEmbeddingDimensions(1024);
    }
    setAiSaved(false);
    setAiError(null);
  }

  function handleAiSave() {
    setAiError(null);
    startAiTransition(async () => {
      try {
        await updateUserSettings({
          aiProvider: selectedProvider,
          aiModel: selectedModel || null,
          embeddingDimensions: embeddingDimensions,
        });
        setAiSaved(true);
        setTimeout(() => setAiSaved(false), 3000);
      } catch (e) {
        setAiError(
          e instanceof Error ? e.message : "Failed to save preferences.",
        );
      }
    });
  }

  const currentModels = MODELS_BY_PROVIDER[selectedProvider] ?? [];

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>AI Model</CardTitle>
        <CardDescription>
          Choose which AI provider and model powers CV parsing, gap
          analysis, and cover letter generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        {/* Provider picker */}
        <div className="flex flex-col gap-3">
          <Label>Provider</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.value}
                type="button"
                onClick={() => handleProviderChange(provider.value)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors",
                  selectedProvider === provider.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-medium leading-none">
                  {provider.label}
                </span>
                <span className="mt-1 text-xs text-muted-foreground leading-snug">
                  {provider.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Model picker */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model-select">Model</Label>

          {currentModels.length === 0 ? (
            <p className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
              Model is configured via your Open WebUI / Ollama endpoint.
            </p>
          ) : (
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select a model…" />
              </SelectTrigger>
              <SelectContent position="popper">
                {currentModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <span className="font-medium">{model.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator />

        {/* Embedding Dimensions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="dimensions-input">Embedding Dimensions</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Dimension of the vector embeddings used for similarity search.
                Must match the pgvector column configuration in your database.
              </p>
            </div>
            {selectedProvider === "openai" && (
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                OpenAI Enforced
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Input
              id="dimensions-input"
              type="number"
              min={2}
              max={8192}
              value={embeddingDimensions}
              onChange={(e) => setEmbeddingDimensions(parseInt(e.target.value) || 1024)}
              disabled={selectedProvider === "openai" || aiPending}
              className="max-w-[120px]"
            />
            <span className="text-xs text-muted-foreground leading-normal">
              {selectedProvider === "openai"
                ? "Locked to 1536 for OpenAI models."
                : "Typically 1024 or 1536. Recommend 1024 for custom embeddings."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleAiSave} disabled={aiPending}>
            {aiPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : aiSaved ? (
              <>
                <Check className="size-4 text-white" />
                Saved
              </>
            ) : (
              "Save preferences"
            )}
          </Button>

          {aiError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {aiError}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
