"use server";

import { db } from "@/lib/db";
import { jobPostings } from "@/lib/db/schema";
import { auth } from "@/auth";
import * as cheerio from "cheerio";
import { processPosting } from "./process-posting";
import { eq, and } from "drizzle-orm";

export async function ingestPosting(applicationId: string, url?: string, fallbackText?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let text = fallbackText || "";

  // Only scrape if we don't have description text already
  if (url && !text) {
    try {
      const apiKey = process.env.JINA_API_KEY;
      const jinaUrl = `https://r.jina.ai/${url.trim()}`;
      const headers: Record<string, string> = {
        Accept: "text/plain",
        "X-Return-Format": "text",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      let response: Response;
      try {
        response = await fetch(jinaUrl, { headers, signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.ok) {
        text = await response.text();
      } else {
        throw new Error(`Jina Reader responded with status ${response.status}`);
      }
    } catch (jinaErr) {
      console.warn("Jina Reader failed, falling back to raw cheerio scraper:", jinaErr);
      
      // Cheerio raw fetch fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        let response: Response;
        try {
          response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        // Simple text extraction: remove script/style/nav/footer, grab body text
        $("script, style, nav, footer, noscript, iframe").remove();
        text = $("body").text().replace(/\s+/g, " ").trim();
      } catch (scrapeErr) {
        console.error("Cheerio scraping failed too:", scrapeErr);
        const errMessage = scrapeErr instanceof Error ? scrapeErr.message : String(scrapeErr);
        throw new Error(`Failed to scrape job URL: ${errMessage}`);
      }
    }
  }

  if (!text) {
    throw new Error("No job description text provided or scraped.");
  }

  // Check if posting already exists
  const existing = await db.query.jobPostings.findFirst({
    where: and(
      eq(jobPostings.applicationId, applicationId),
      eq(jobPostings.userId, session.user.id)
    ),
  });

  let postingId: string;

  if (existing) {
    postingId = existing.id;
    await db
      .update(jobPostings)
      .set({
        rawText: text,
        status: "processing",
        errorMessage: null,
        processedAt: null,
      })
      .where(eq(jobPostings.id, postingId));
  } else {
    const inserted = await db
      .insert(jobPostings)
      .values({
        applicationId,
        userId: session.user.id,
        rawText: text,
        status: "processing",
      })
      .returning({ id: jobPostings.id });
    postingId = inserted[0].id;
  }

  // Run processing
  await processPosting(postingId);

  return { postingId, status: "processing" };
}
