import {
  customType,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const applicationStatusesEnum = pgEnum("application_statuses", [
  "bookmarked",
  "applying",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
]);

export const applicationTypesEnum = pgEnum("application_types", [
  "full-time",
  "part-time",
  "contract",
  "internship",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "phone_screen",
  "technical",
  "behavioral",
  "onsite",
  "final",
]);

export const interviewOutcomeEnum = pgEnum("interview_outcome", [
  "passed",
  "failed",
  "pending",
]);

export const jobPostingStatusEnum = pgEnum("job_posting_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  aiProvider: text("ai_provider"),
  aiModel: text("ai_model"),
  embeddingDimensions: integer("embedding_dimensions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // what the user pastes or uploads
  cvRawText: text("cv_raw_text"),


  skills: text("skills"), // JSON: string[]
  experience: text("experience"), // JSON: { company, role, years, bullets[] }[]
  education: text("education"), // JSON: { degree, institution, year }[]
  languages: text("languages"), // JSON: string[]
  summary: text("summary"), // AI-generated 2-sentence profile summary

  // Vector embedding of the full CV (1536-dim for OpenAI, 1024 for others)
  // Vector embedding of the full CV (1536-dim for OpenAI, 1024 for others)
  // Requires: CREATE EXTENSION vector; in your DB migration
  embedding: vector("embedding", { dimensions: 1536 }),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  description: text("description"),
  notes: text("notes"),
  status: applicationStatusesEnum("status").notNull().default("bookmarked"),
  jobUrl: text("job_url"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  type: applicationTypesEnum("type").notNull().default("full-time"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobPostings = pgTable("job_postings", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .unique()
    .references(() => applications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Raw scraped text
  rawText: text("raw_text"),

  // Structured extraction
  requiredSkills: text("required_skills"), // JSON: string[]
  niceToHave: text("nice_to_have"), // JSON: string[]
  seniorityLevel: text("seniority_level"), // "junior" | "mid" | "senior"
  techStack: text("tech_stack"), // JSON: string[]
  responsibilities: text("responsibilities"), // JSON: string[]
  companySize: text("company_size"), // "startup" | "mid" | "enterprise"
  remotePolicy: text("remote_policy"), // "remote" | "hybrid" | "onsite"

  // Processing state
  status: jobPostingStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),

  // Vector embedding of the posting
  embedding: vector("embedding", { dimensions: 1536 }),

  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gapAnalyses = pgTable("gap_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Scores (0–100)
  overallMatchScore: integer("overall_match_score"),
  skillMatchScore: integer("skill_match_score"),
  experienceScore: integer("experience_score"),

  // Structured results
  matchedSkills: text("matched_skills"), // JSON: string[]
  missingSkills: text("missing_skills"), // JSON: string[]
  partialSkills: text("partial_skills"), // JSON: string[]
  recommendations: text("recommendations"), // JSON: string[]
  summary: text("summary"), // 3-sentence human summary

  modelUsed: text("model_used").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  category: text("category").notNull(),
  // "technical" | "behavioral" | "role-specific" | "culture"

  question: text("question").notNull(),
  suggestedAnswer: text("suggested_answer"), // AI draft based on user's CV
  userAnswer: text("user_answer"), // user writes their own
  difficulty: text("difficulty"), // "easy" | "medium" | "hard"

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role"),
  linkedinUrl: text("linkedin_url"),
  notes: text("notes"),
});

export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "cascade",
  }),
  scheduledAt: timestamp("scheduled_at"),
  type: interviewTypeEnum("type").notNull().default("phone_screen"),
  notes: text("notes"),
  outcome: interviewOutcomeEnum("outcome").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const coverLetters = pgTable("cover_letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "set null",
  }), // keep cover letters if app deleted
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content"), // generated/AI letters only; null for uploaded files
  promptContext: text("prompt_context").notNull(),
  model: text("model_used").notNull(),
  fileName: text("file_name"),
  fileMimeType: text("file_mime_type"),
  fileSize: integer("file_size"),
  fileData: bytea("file_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "cascade",
  }),
  fieldChanged: text("field_changed").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// relationships

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [applications.userId],
      references: [users.id],
    }),
    contacts: many(contacts),
    interviews: many(interviews),
    coverLetters: many(coverLetters),
    activityLog: many(activityLog),
    jobPosting: one(jobPostings, {
      fields: [applications.id],
      references: [jobPostings.applicationId],
    }),
    gapAnalyses: many(gapAnalyses),
    interviewQuestions: many(interviewQuestions),
  }),
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  application: one(applications, {
    fields: [contacts.applicationId],
    references: [applications.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  application: one(applications, {
    fields: [coverLetters.applicationId],
    references: [applications.id],
  }),
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  application: one(applications, {
    fields: [activityLog.applicationId],
    references: [applications.id],
  }),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one }) => ({
  application: one(applications, {
    fields: [jobPostings.applicationId],
    references: [applications.id],
  }),
  user: one(users, {
    fields: [jobPostings.userId],
    references: [users.id],
  }),
}));

export const gapAnalysesRelations = relations(gapAnalyses, ({ one }) => ({
  application: one(applications, {
    fields: [gapAnalyses.applicationId],
    references: [applications.id],
  }),
}));

export const interviewQuestionsRelations = relations(
  interviewQuestions,
  ({ one }) => ({
    application: one(applications, {
      fields: [interviewQuestions.applicationId],
      references: [applications.id],
    }),
  }),
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

//  NextAuth tables
// Required by @auth/drizzle-adapter

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Relations for the NextAuth tables
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// relations for users table
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  coverLetters: many(coverLetters),
  accounts: many(accounts),
  sessions: many(sessions),
}));

// TypeScript types
// Infer types directly from the schema

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationStatus = Application["status"];

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;

export type ActivityLog = typeof activityLog.$inferSelect;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type JobPosting = typeof jobPostings.$inferSelect;
export type NewJobPosting = typeof jobPostings.$inferInsert;
export type GapAnalysis = typeof gapAnalyses.$inferSelect;
export type NewGapAnalysis = typeof gapAnalyses.$inferInsert;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type NewInterviewQuestion = typeof interviewQuestions.$inferInsert;
