import type { Application } from "@/lib/db"

export const STATUS_OPTIONS = [
  "bookmarked",
  "applying",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const


export const INTERVIEW_TYPE_OPTIONS = [
  "phone_screen",
  "technical",
  "behavioral",
  "onsite",
  "final",
] as const


export type ApplicationStatus = typeof STATUS_OPTIONS[number]

export interface ApplicationsFilter {
  search?: string
  status?: ApplicationStatus | "all"
  page?: number
}

export interface PaginatedApplications {
  data: Application[]
  total: number
  page: number
  pages: number
  limit: number
}


// Status display config — single source of truth for labels and colours
export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }>
  = {
  bookmarked: {
    label: "Bookmarked",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  applying: {
    label: "Applying",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  applied: {
    label: "Applied",
    className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  offered: {
    label: "Offered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
}