CREATE TYPE "public"."job_posting_status" AS ENUM('pending', 'processing', 'ready', 'failed');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "embedding_dimensions" integer;