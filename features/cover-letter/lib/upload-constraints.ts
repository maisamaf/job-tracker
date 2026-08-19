export const ALLOWED_COVER_LETTER_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_COVER_LETTER_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const COVER_LETTER_FILE_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
