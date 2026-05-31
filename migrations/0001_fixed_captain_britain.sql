ALTER TABLE "applications" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "job_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "salary_min" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "salary_max" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "applied_at" DROP NOT NULL;