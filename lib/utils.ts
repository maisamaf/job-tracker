import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) =>
    n >= 1000 ? `€${(n / 1000).toFixed(0)}k` : `€${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `up to ${fmt(max!)}`;
}

export function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCleanJobDescription(
  description?: string | null,
  rawText?: string | null,
): string {
  if (description && description.trim().length > 0) {
    return description.trim();
  }
  if (rawText && rawText.trim().length > 0) {
    const lower = rawText.toLowerCase();
    const isSignInPage =
      lower.includes("sign in with apple") ||
      lower.includes("keep me logged in") ||
      lower.includes("new to linkedin") ||
      (lower.includes("sign in") && lower.includes("user agreement")) ||
      (lower.includes("linkedin respects your privacy") && lower.includes("cookies"));

    if (!isSignInPage) {
      return rawText.trim();
    }
  }
  return "";
}
