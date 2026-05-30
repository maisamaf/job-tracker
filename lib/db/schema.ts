
import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm'

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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
})

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role"),
  linkedinUrl: text("linkedin_url"),
  notes: text("notes"),
})

export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at"),
  type: interviewTypeEnum("type").notNull().default("phone_screen"),
  notes: text("notes"),
  outcome: interviewOutcomeEnum("outcome").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const coverLetters = pgTable("cover_letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "set null",
  }), // keep cover letters if app deleted
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  promptContext: text("prompt_context").notNull(),
  model: text("model_used").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  fieldChanged: text("field_changed").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


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

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
    (vt) => [
      primaryKey({ columns: [vt.identifier, vt.token] }),
    ]
)

// Relations for the NextAuth tables
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// relations for users table
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  coverLetters: many(coverLetters),
  accounts: many(accounts),
  sessions: many(sessions),
}))


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
