"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { SkillsTagInput } from "@/features/profile/components/skills-tag-input";
import { upsertProfile } from "@/features/profile/actions/upsert-profile";
import { streamAndParseCv } from "@/features/profile/lib/parse-cv-client";
import { CollapsibleTextarea } from "@/components/ui/collapsible-textarea";
import type { Experience as ExperienceEntry, Education as EducationEntry } from "@/features/profile/types";

// Helpers 

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

interface ProfileSettingsFormProps {
  userAiProvider: string | null;
  userAiModel: string | null;
  profile: {
    cvRawText: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
    languages: string | null;
    summary: string | null;
  } | null;
}

export function ProfileSettingsForm({ userAiProvider, userAiModel, profile }: ProfileSettingsFormProps) {
  // Profile & CV State
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

  // CV Parsing State
  const [isParsing, setIsParsing] = useState(false);

  async function handleParseCv() {
    if (!cvText.trim()) return;
    setParseError(null);
    setIsParsing(true);
    try {
      const data = await streamAndParseCv(cvText, {
        aiProvider: userAiProvider || undefined,
        aiModel: userAiModel || undefined,
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

  // Experience & Education Modifiers 

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

  return (
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
              <p className="mt-1 text-xs text-muted-foreground font-normal">
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
              <p className="text-xs text-muted-foreground font-normal">
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
                <Check className="size-4 text-white" />
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
  );
}
