"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { STATUS_OPTIONS, STATUS_CONFIG } from "../types";
import type { ActionState, CreateApplicationInput } from "../schemas";
import type { Application } from "@/lib/db";
import { Loader2, ArrowLeft, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ApplicationFormProps {
  initialData?: Application; // present = edit mode, absent = create mode
}

const INITIAL_STATE: ActionState<CreateApplicationInput> = {};

export function ApplicationForm({ initialData }: ApplicationFormProps) {
  const isEditing = !!initialData;
  const [date, setDate] = useState<Date | undefined>(undefined);
  // Bind the id for edit mode so the action signature matches useActionState
  const action = isEditing
    ? updateApplication.bind(null, initialData.id)
    : createApplication;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.errors) {
      const firstError = formRef.current?.querySelector(
        "[aria-invalid='true']",
      );
      if (firstError) (firstError as HTMLElement).focus();
    }
  }, [state.errors]);

  // On error, echo back submitted values; otherwise show initial data
  const v = state.values ?? {};

  function fieldValue(key: keyof Application, fallback = ""): string {
    if (state.values) return v[key] ?? fallback;
    if (initialData) {
      const val = initialData[key];
      if (val == null) return fallback;
      if (val instanceof Date) return format(val, "yyyy-MM-dd");
      return String(val);
    }
    return fallback;
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
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
        {/* ── Section 1: Role ─────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Role
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              id="company"
              label="Company"
              required
              error={state.errors?.company}
            >
              <Input
                id="company"
                name="company"
                placeholder="e.g. Stripe"
                defaultValue={fieldValue("company")}
                aria-invalid={!!state.errors?.company}
                disabled={isPending}
                autoFocus={!isEditing}
              />
            </FormField>

            <FormField
              id="role"
              label="Role"
              required
              error={state.errors?.role}
            >
              <Input
                id="role"
                name="role"
                placeholder="e.g. Senior Frontend Engineer"
                defaultValue={fieldValue("role")}
                aria-invalid={!!state.errors?.role}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="location"
              label="Location"
              error={state.errors?.location}
            >
              <Input
                id="location"
                name="location"
                placeholder="e.g. Berlin or Remote"
                defaultValue={fieldValue("location")}
                aria-invalid={!!state.errors?.location}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="status"
              label="Status"
              required
              error={state.errors?.status}
            >
              <Select
                name="status"
                defaultValue={fieldValue("status", "bookmarked")}
                disabled={isPending}
              >
                <SelectTrigger
                  id="status"
                  aria-invalid={!!state.errors?.status}
                >
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
                defaultValue={fieldValue("jobUrl")}
                aria-invalid={!!state.errors?.jobUrl}
                disabled={isPending}
              />
            </FormField>
          </div>
        </section>

        {/* ── Section 2: Compensation ──────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
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
                  defaultValue={fieldValue("salaryMin")}
                  aria-invalid={!!state.errors?.salaryMin}
                  disabled={isPending}
                  className="pl-7"
                />
              </div>
            </FormField>
            <FormField
              id="salaryMax"
              label="Max salary"
              error={state.errors?.salaryMax}
            >
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
                  defaultValue={fieldValue("salaryMax")}
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Details
          </h2>
          <div className="flex flex-col gap-5">
            <FormField
              id="description"
              label="Job description"
              error={state.errors?.description}
              hint="Paste the full job posting — used by the AI cover letter generator"
            >
              <Textarea
                id="description"
                name="description"
                placeholder="Paste the job description here..."
                defaultValue={fieldValue("description")}
                aria-invalid={!!state.errors?.description}
                disabled={isPending}
                className="min-h-[140px] resize-y"
              />
            </FormField>

            <FormField
              id="notes"
              label="Notes"
              error={state.errors?.notes}
              hint="Private notes — referrals, impressions, things to research"
            >
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any personal notes about this role..."
                defaultValue={fieldValue("notes")}
                aria-invalid={!!state.errors?.notes}
                disabled={isPending}
                className="min-h-[100px] resize-y"
              />
            </FormField>
          </div>
        </section>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <Button type="submit" disabled={isPending} className="min-w-[140px]">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Save application"
            )}
          </Button>
          <Button variant="ghost" asChild disabled={isPending}>
            <Link
              href={
                isEditing ? `/applications/${initialData.id}` : "/applications"
              }
            >
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
