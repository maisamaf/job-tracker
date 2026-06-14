"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./form-field";
import { createApplication } from "../actions/create-application";
import { updateApplication } from "../actions/update-application";
import { autofillFromUrl, autofillFromText } from "../actions/autofill-from-url";
import { STATUS_OPTIONS, STATUS_CONFIG } from "../types";
import type { ActionState, CreateApplicationInput } from "../schemas";
import type { Application } from "@/lib/db";
import { Loader2, ArrowLeft, CalendarIcon, Square, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CollapsibleTextarea } from "@/components/ui/collapsible-textarea";

interface ApplicationFormProps {
  initialData?: Application;
}

const INITIAL_STATE: ActionState<CreateApplicationInput> = {};

export function ApplicationForm({ initialData }: ApplicationFormProps) {
  const isEditing = !!initialData;
  const [date, setDate] = useState<Date | undefined>(() =>
    initialData?.appliedAt ? new Date(initialData.appliedAt) : undefined
  );

  const action = isEditing
    ? updateApplication.bind(null, initialData.id)
    : createApplication;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const formRef = useRef<HTMLFormElement>(null);

  // Controlled values for autofill
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [role, setRole] = useState(initialData?.role ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl ?? "");

  // Autofill state
  const [autofillUrl, setAutofillUrl] = useState("");
  const [autofillText, setAutofillText] = useState("");
  const [autofillMode, setAutofillMode] = useState<"url" | "paste">("url");
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [isFetching, startFetch] = useTransition();

  useEffect(() => {
    if (state.errors) {
      const firstError = formRef.current?.querySelector("[aria-invalid='true']");
      if (firstError) (firstError as HTMLElement).focus();
    }
  }, [state.errors]);

  // On server validation error, echo back submitted values
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.values) {
      setCompany(state.values.company ?? "");
      setRole(state.values.role ?? "");
      setLocation(state.values.location ?? "");
      setDescription(state.values.description ?? "");
      setJobUrl(state.values.jobUrl ?? "");
      setDate(state.values.appliedAt ? new Date(state.values.appliedAt) : undefined);
    }
  }

  function handleAutofill() {
    setAutofillError(null);
    startFetch(async () => {
      try {
        let result;
        if (autofillMode === "url") {
          if (!autofillUrl.trim()) return;
          result = await autofillFromUrl(autofillUrl.trim());
        } else {
          if (!autofillText.trim()) return;
          result = await autofillFromText(autofillText.trim());
        }

        console.log("[handleAutofill] result received on client:", result);

        if (!result) {
          throw new Error("No response received from the autofill server action.");
        }

        if (!result.ok) {
          setAutofillError(result.error);
          return;
        }

        if (result.company) setCompany(result.company);
        if (result.role) setRole(result.role);
        if (result.location) setLocation(result.location);
        if (autofillMode === "url") {
          if (!jobUrl) setJobUrl(autofillUrl.trim());
          if (result.description) setDescription(result.description);
        } else {
          if (result.description) setDescription(result.description);
        }
      } catch (err) {
        console.error("[handleAutofill] Client-side transition error caught:", err);
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during autofill.";
        setAutofillError(message);
      }
    });
  }

  return (
    <div className="max-w-2xl pb-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={isEditing ? `/applications/${initialData.id}` : "/applications"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isEditing ? "Back to application" : "Back to applications"}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit application" : "Add application"}
        </h1>
        {isEditing && (
          <p className="text-sm text-muted-foreground mt-1">
            {initialData.role} at {initialData.company}
          </p>
        )}
      </div>

      {state.errors?.root && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.errors.root[0]}
        </div>
      )}

      <form ref={formRef} action={formAction} noValidate>

        {/* ── Autofill from URL  */}
        {!isEditing && (
          <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Square className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold">Autofill from job URL</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste the direct job posting URL and we&apos;ll extract the role, company, location, and description automatically.
              {" "}<strong className="font-medium text-foreground/70">On LinkedIn, open the job and copy the URL from the address bar</strong> — not the recommended jobs page URL.
              If the URL doesn&apos;t work, use the &quot;Paste description&quot; tab.
            </p>

            {/* Mode tabs */}
            <div className="flex gap-4 border-b border-border">
              {(["url", "paste"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setAutofillMode(m); setAutofillError(null); }}
                  className={[
                    "pb-2 text-xs font-medium border-b-2 transition-colors",
                    autofillMode === m
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {m === "url" ? "Import from URL" : "Paste description"}
                </button>
              ))}
            </div>

            {autofillMode === "url" ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <Input
                    type="url"
                    placeholder="https://company.com/jobs/..."
                    value={autofillUrl}
                    onChange={(e) => setAutofillUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAutofill())}
                    disabled={isFetching}
                    className="pl-9 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAutofill}
                  disabled={isFetching || !autofillUrl.trim()}
                  className="gap-1.5 shrink-0"
                >
                  {isFetching ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching…</>
                  ) : (
                    <><Square className="h-3 w-3" /> Fetch &amp; fill</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste the full job description here — AI will extract company, role, location and fill the form..."
                  value={autofillText}
                  onChange={(e) => setAutofillText(e.target.value)}
                  disabled={isFetching}
                  className="min-h-[120px] resize-y text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAutofill}
                  disabled={isFetching || !autofillText.trim()}
                  className="gap-1.5 w-full"
                >
                  {isFetching ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting fields…</>
                  ) : (
                    <><Square className="h-3 w-3" /> Extract &amp; fill</>
                  )}
                </Button>
              </div>
            )}

            {autofillError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {autofillError}
              </p>
            )}
          </div>
        )}

        {/* ── Section 1: Role ─────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Role
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="company" label="Company" required error={state.errors?.company}>
              <Input
                id="company"
                name="company"
                placeholder="e.g. Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                aria-invalid={!!state.errors?.company}
                disabled={isPending || isFetching}
                autoFocus={!isEditing}
              />
            </FormField>

            <FormField id="role" label="Role" required error={state.errors?.role}>
              <Input
                id="role"
                name="role"
                placeholder="e.g. Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-invalid={!!state.errors?.role}
                disabled={isPending || isFetching}
              />
            </FormField>

            <FormField id="location" label="Location" error={state.errors?.location}>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Berlin or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-invalid={!!state.errors?.location}
                disabled={isPending || isFetching}
              />
            </FormField>

            <FormField id="status" label="Status" required error={state.errors?.status}>
              <Select
                name="status"
                defaultValue={state.values?.status ?? initialData?.status ?? "bookmarked"}
                disabled={isPending}
              >
                <SelectTrigger id="status" aria-invalid={!!state.errors?.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="jobUrl"
              label="Job posting URL"
              error={state.errors?.jobUrl}
              className="sm:col-span-2"
            >
              <Input
                id="jobUrl"
                name="jobUrl"
                type="url"
                placeholder="https://company.com/jobs/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                aria-invalid={!!state.errors?.jobUrl}
                disabled={isPending}
              />
            </FormField>
          </div>
        </section>

        {/* ── Section 2: Compensation ──────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Compensation
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              id="salaryMin"
              label="Min salary"
              error={state.errors?.salaryMin}
              hint="Annual gross"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                  €
                </span>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min={0}
                  placeholder="60000"
                  defaultValue={state.values?.salaryMin ?? initialData?.salaryMin ?? ""}
                  aria-invalid={!!state.errors?.salaryMin}
                  disabled={isPending}
                  className="pl-7"
                />
              </div>
            </FormField>

            <FormField id="salaryMax" label="Max salary" error={state.errors?.salaryMax}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                  €
                </span>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min={0}
                  placeholder="90000"
                  defaultValue={state.values?.salaryMax ?? initialData?.salaryMax ?? ""}
                  aria-invalid={!!state.errors?.salaryMax}
                  disabled={isPending}
                  className="pl-7"
                />
              </div>
            </FormField>

            <FormField
              id="appliedAt"
              label="Date applied"
              error={state.errors?.appliedAt}
              hint="Leave blank if you haven't applied yet"
            >
              <input
                type="hidden"
                name="appliedAt"
                value={date ? date.toISOString().split("T")[0] : ""}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!date}
                    className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    aria-invalid={!!state.errors?.appliedAt}
                    disabled={isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </FormField>
          </div>
        </section>

        {/* ── Section 3: Details ───────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Details
          </h2>
          <div className="flex flex-col gap-5">
            <CollapsibleTextarea
              id="description"
              name="description"
              label="Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the job description here..."
              aria-invalid={!!state.errors?.description}
              disabled={isPending || isFetching}
            />
            <FormField
              id="notes"
              label="Notes"
              error={state.errors?.notes}
              hint="Private — referrals, impressions, things to research"
            >
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any personal notes about this role..."
                defaultValue={state.values?.notes ?? initialData?.notes ?? ""}
                aria-invalid={!!state.errors?.notes}
                disabled={isPending}
                className="min-h-[100px] resize-y"
              />
            </FormField>
          </div>
        </section>

        {/* ── Actions  */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <Button type="submit" disabled={isPending} className="min-w-[140px]">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Save application"
            )}
          </Button>
          <Button variant="ghost" asChild disabled={isPending}>
            <Link href={isEditing ? `/applications/${initialData.id}` : "/applications"}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
