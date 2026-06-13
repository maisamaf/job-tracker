"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  User,
  FileText,
  Bot,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { SkillsTagInput } from "@/features/profile/components/skills-tag-input";
import { upsertProfile } from "@/features/profile/actions/upsert-profile";
import { updateUserSettings } from "@/features/settings/actions/update-user-settings";
import {
  AI_PROVIDERS,
  MODELS_BY_PROVIDER,
} from "@/features/settings/lib/ai-config";
import { streamAndParseCv } from "@/features/profile/lib/parse-cv-client";
import { CollapsibleTextarea } from "@/components/ui/collapsible-textarea";

// ─── Helpers 

function parseJsonStringArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function parseJsonObjectArray(json: string | null | undefined): object[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as object[]) : [];
  } catch {
    return [];
  }
}

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

// ─── Types 

interface ExperienceEntry {
  company: string;
  role: string;
  years: string;
  bullets: string[];
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    aiProvider: string | null;
    aiModel: string | null;
    embeddingDimensions: number | null;
  };
  profile: {
    cvRawText: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
    languages: string | null;
    summary: string | null;
  } | null;
}

// ─── Component 

export function SettingsView({ user, profile }: SettingsViewProps) {
  // ── Account 
  const [name, setName] = useState(user.name);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountPending, startAccountTransition] = useTransition();

  // ── Profile & CV
  const [cvText, setCvText] = useState(profile?.cvRawText ?? "");
  const [skills, setSkills] = useState<string[]>(() =>
    parseJsonStringArray(profile?.skills),
  );
  const [languages, setLanguages] = useState<string[]>(() =>
    parseJsonStringArray(profile?.languages),
  );
  const [summary, setSummary] = useState(profile?.summary ?? "");
  const [experience, setExperience] = useState<ExperienceEntry[]>(() =>
    parseJsonObjectArray(profile?.experience) as ExperienceEntry[],
  );
  const [education, setEducation] = useState<EducationEntry[]>(() =>
    parseJsonObjectArray(profile?.education) as EducationEntry[],
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePending, startProfileTransition] = useTransition();

  // ── AI Model 
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

  // ── CV Parsing 
  const [isParsing, setIsParsing] = useState(false);

  // ── Handlers 

  function handleAccountSave() {
    setAccountError(null);
    startAccountTransition(async () => {
      try {
        await updateUserSettings({ name: name.trim() });
        setAccountSaved(true);
        setTimeout(() => setAccountSaved(false), 3000);
      } catch (e) {
        setAccountError(
          e instanceof Error ? e.message : "Failed to save changes.",
        );
      }
    });
  }

  async function handleParseCv() {
    if (!cvText.trim()) return;
    setParseError(null);
    setIsParsing(true);
    try {
      const data = await streamAndParseCv(cvText, {
        aiProvider: selectedProvider || undefined,
        aiModel: selectedModel || undefined,
      });
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setLanguages(Array.isArray(data.languages) ? data.languages : []);
      setSummary(typeof data.summary === "string" ? data.summary : "");
      setExperience(Array.isArray(data.experience) ? (data.experience as ExperienceEntry[]) : []);
      setEducation(Array.isArray(data.education) ? (data.education as EducationEntry[]) : []);
    } catch (e) {
      setParseError(
        e instanceof Error ? e.message : "CV parsing failed. Please try again.",
      );
    } finally {
      setIsParsing(false);
    }
  }

  function handleProfileSave() {
    setProfileError(null);
    startProfileTransition(async () => {
      try {
        await upsertProfile({
          cvRawText: cvText,
          skills,
          languages,
          summary,
          experience,
          education,
        });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } catch (e) {
        setProfileError(
          e instanceof Error ? e.message : "Failed to save profile.",
        );
      }
    });
  }

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

  // ── Experience & Education Modifiers 

  function addExperience() {
    setExperience((prev) => [
      ...prev,
      { company: "", role: "", years: "", bullets: [] },
    ]);
  }

  function removeExperience(index: number) {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExperience(index: number, fields: Partial<ExperienceEntry>) {
    setExperience((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...fields } : item)),
    );
  }

  function addEducation() {
    setEducation((prev) => [
      ...prev,
      { degree: "", institution: "", year: "" },
    ]);
  }

  function removeEducation(index: number) {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEducation(index: number, fields: Partial<EducationEntry>) {
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...fields } : item)),
    );
  }

  const currentModels = MODELS_BY_PROVIDER[selectedProvider] ?? [];

  // ── Render 

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, profile, and AI preferences.
        </p>
      </div>

      <Tabs
        defaultValue="account"
        orientation="vertical"
        className="items-start gap-6"
      >
        <TabsList variant="line" className="w-44 shrink-0 gap-0.5">
          <TabsTrigger value="account" className="gap-2">
            <User className="size-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <FileText className="size-4" />
            Profile & CV
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="size-4" />
            AI Model
          </TabsTrigger>
        </TabsList>

        {/* ── Account  */}
        <TabsContent value="account">
          <Card>
            <CardHeader className="border-b pb-6">
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={accountPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email address cannot be changed here.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAccountSave}
                  disabled={accountPending || !name.trim()}
                >
                  {accountPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : accountSaved ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>

                {accountError && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {accountError}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profile & CV  */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="border-b pb-6">
              <CardTitle>Profile & CV</CardTitle>
              <CardDescription>
                Paste your CV and let AI extract your skills and summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6">
              {/* CV / Resume */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      CV / Resume
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paste your CV text below. Use &ldquo;Parse with AI&rdquo;
                      to auto-fill skills and summary.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleParseCv}
                    disabled={isParsing || !cvText.trim()}
                    className="shrink-0 gap-1.5"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Parsing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Parse with AI
                      </>
                    )}
                  </Button>
                </div>

                {/* <Textarea
                  placeholder="Paste your CV or resume here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="min-h-48 resize-y"
                  disabled={isParsing}
                /> */}
                <CollapsibleTextarea
                  label=" "
                  placeholder="Paste your CV or resume here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="min-h-48 resize-y"
                  disabled={isParsing}
                />

                {parseError && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {parseError}
                  </p>
                )}
              </div>

              <Separator />

              {/* Skills */}
              <div className="flex flex-col gap-1.5">
                <Label>Skills</Label>
                <SkillsTagInput
                  value={skills}
                  onChange={setSkills}
                  disabled={isParsing}
                />
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add a skill. Backspace removes the
                  last one.
                </p>
              </div>

              <Separator />

              {/* Languages */}
              <div className="flex flex-col gap-1.5">
                <Label>Languages</Label>
                <SkillsTagInput
                  value={languages}
                  onChange={setLanguages}
                  placeholder="Add a language…"
                  disabled={isParsing}
                />
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add a language. Backspace removes the last one.
                </p>
              </div>

              <Separator />

              {/* Summary */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A concise professional summary…"
                  className="min-h-20 resize-y"
                  disabled={isParsing}
                />
              </div>

              <Separator />

              {/* Work Experience */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Work Experience</h3>
                    <p className="text-xs text-muted-foreground">
                      Add or modify your previous professional roles.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Add Work
                  </Button>
                </div>

                {experience.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 border border-dashed rounded-lg p-4 text-center">
                    No work experience added yet. Click &ldquo;Add Work&rdquo; to begin.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-xl bg-card relative group flex flex-col gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove experience entry"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Company</Label>
                            <Input
                              placeholder="e.g. Stripe"
                              value={exp.company || ""}
                              onChange={(e) =>
                                updateExperience(index, { company: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Role / Title</Label>
                            <Input
                              placeholder="e.g. Software Engineer"
                              value={exp.role || ""}
                              onChange={(e) =>
                                updateExperience(index, { role: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Years / Date Range</Label>
                            <Input
                              placeholder="e.g. 2021 - Present"
                              value={exp.years || ""}
                              onChange={(e) =>
                                updateExperience(index, { years: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 pr-8">
                          <Label className="text-xs">Key Accomplishments (One per line)</Label>
                          <Textarea
                            placeholder="e.g. Built core features...\nLed a team of 3 engineers..."
                            value={exp.bullets ? exp.bullets.join("\n") : ""}
                            onChange={(e) =>
                              updateExperience(index, {
                                bullets: e.target.value.split("\n"),
                              })
                            }
                            className="min-h-16 text-sm py-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Education */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Education</h3>
                    <p className="text-xs text-muted-foreground">
                      Add or modify your degrees and academic history.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Add Education
                  </Button>
                </div>

                {education.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 border border-dashed rounded-lg p-4 text-center">
                    No education history added yet. Click &ldquo;Add Education&rdquo; to begin.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-xl bg-card relative group flex flex-col gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove education entry"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Degree / Field</Label>
                            <Input
                              placeholder="e.g. B.Sc. Computer Science"
                              value={edu.degree || ""}
                              onChange={(e) =>
                                updateEducation(index, { degree: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Institution</Label>
                            <Input
                              placeholder="e.g. Stanford University"
                              value={edu.institution || ""}
                              onChange={(e) =>
                                updateEducation(index, { institution: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Year / Range</Label>
                            <Input
                              placeholder="e.g. 2018 - 2022"
                              value={edu.year || ""}
                              onChange={(e) =>
                                updateEducation(index, { year: e.target.value })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleProfileSave}
                  disabled={profilePending || isParsing}
                >
                  {profilePending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : profileSaved ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      Saved
                    </>
                  ) : (
                    "Save profile"
                  )}
                </Button>

                {profileError && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {profileError}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI Model  */}
        <TabsContent value="ai">
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
                      <Check className="size-4 text-emerald-500" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
