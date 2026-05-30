import { z } from "zod"
import { INTERVIEW_TYPE_OPTIONS, STATUS_OPTIONS } from "./types";

export const createApplicationSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name is too long"),

  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role title is too long"),

  status: z.enum(STATUS_OPTIONS, { error: "Status is required" }),


  location: z
    .string()
    .max(100, "Location is too long")
    .optional()
    .or(z.literal("")),

  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  salaryMin: z
    .string()
    .optional()
    .transform((val) => (val && val !== "" ? parseInt(val, 10) : undefined))
    .pipe(
      z
        .number({ error: "Must be a number" })
        .positive("Must be positive")
        .optional(),
    ),

  salaryMax: z
    .string()
    .optional()
    .transform((val) => (val && val !== "" ? parseInt(val, 10) : undefined))
    .pipe(
      z
        .number({ error: "Must be a number" })
        .positive("Must be positive")
        .optional(),
    ),

  description: z
    .string()
    .max(20000, "Description is too long")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(5000, "Notes are too long")
    .optional()
    .or(z.literal("")),

  appliedAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .pipe(z.date().optional()),
})
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMin <= data.salaryMax
      }
      return true
    },
    {
      message: "Min salary cannot exceed max salary", path: ["salaryMin"]
    });

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),

  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export const interviewSchema = z.object({
  type: z.enum(INTERVIEW_TYPE_OPTIONS, {
    error: "Interview type is required",
  }),
  scheduledAt: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .pipe(z.date().optional()),
  outcome: z
    .enum(["passed", "failed", "pending"])
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export const updateNotesSchema = z.object({
  notes: z.string().max(5000).optional().or(z.literal("")),
})

export const updateStatusSchema = z.object({
  status: z.enum(STATUS_OPTIONS, { error: "Status is required" }),
})


// Edit reuses the same rules
export const updateApplicationSchema = createApplicationSchema

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export type ContactInput = z.infer<typeof contactSchema>
export type InterviewInput = z.infer<typeof interviewSchema>

// The shape returned from every server action
// generic, each caller provides its own key union
export type ActionState<T extends Record<string, unknown> = Record<string, unknown>> = {
  errors?: Partial<Record<keyof T | "root", string[]>>
  values?: Record<string, string>
  success?: boolean
}
