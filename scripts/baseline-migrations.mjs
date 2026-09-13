/**
 * Marks existing SQL migrations as applied in drizzle.__drizzle_migrations.
 * Use when the database schema was created via db:push (or manually) and
 * db:migrate fails replaying migrations from 0000.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env" });

const migrationsFolder = path.join(process.cwd(), "migrations");
const journal = JSON.parse(
  fs.readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf8"),
);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);

const existing = await sql`
  SELECT hash, created_at
  FROM drizzle.__drizzle_migrations
  ORDER BY created_at
`.catch(() => []); // If table doesn't exist yet, return empty array

if (existing.length > 0) {
  console.log(
    `Migration journal already has ${existing.length} entries. Skipping baseline.`,
  );
  process.exit(0);
}

// Ensure the __drizzle_migrations table exists by running a quick query or let drizzle create it on first run
// If __drizzle_migrations table doesn't exist, we should create it first so we can insert into it.
await sql`
  CREATE SCHEMA IF NOT EXISTS "drizzle";
`;
await sql`
  CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" SERIAL PRIMARY KEY,
    "hash" text NOT NULL,
    "created_at" bigint
  );
`;

const CUTOFF_TAG = "0004_familiar_paladin";
console.log(`Baselining migrations up to ${CUTOFF_TAG}…`);

for (const entry of journal.entries) {
  const filePath = path.join(migrationsFolder, `${entry.tag}.sql`);
  const query = fs.readFileSync(filePath, "utf8");
  const hash = crypto.createHash("sha256").update(query).digest("hex");

  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${entry.when})
  `;

  console.log(`  ✓ ${entry.tag}`);

  if (entry.tag === CUTOFF_TAG) {
    console.log(`Reached cutoff tag ${CUTOFF_TAG}. Stopping baseline.`);
    break;
  }
}

console.log("Done. Run bun db:migrate to apply any newer migrations.");

