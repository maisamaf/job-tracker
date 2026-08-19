ALTER TABLE "cover_letters" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD COLUMN "file_mime_type" text;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD COLUMN "file_data" "bytea";