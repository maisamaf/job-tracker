// ── Chart colour palette keyed to status ──────────────────────────────────

import { ApplicationStatus } from "@/lib/db/schema";

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  bookmarked: "#94a3b8",
  applying: "#60a5fa",
  applied: "#818cf8",
  interviewing: "#f59e0b",
  offered: "#10b981",
  rejected: "#f87171",
  withdrawn: "#fb923c",
};
