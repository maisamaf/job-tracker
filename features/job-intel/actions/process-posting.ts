"use server";

import { db } from "@/lib/db";
import { jobPostings, users } from "@/lib/db/schema";
import { getLanguageModel, AIProvider } from "@/lib/ai";
import { generateJsonObject } from "@/lib/ai/generate-json-object";
import { jobPostingExtractionSchema } from "../types";
import { eq } from "drizzle-orm";

export async function processPosting(postingId: string) {
  try {
    // 1. Fetch posting
    const posting = await db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, postingId),
    });

    if (!posting) {
      throw new Error(`Job posting with ID ${postingId} not found`);
    }

    if (!posting.rawText) {
      throw new Error("No raw text to process");
    }

    // 2. Resolve AI Model
    const user = await db.query.users.findFirst({
      where: eq(users.id, posting.userId),
      columns: { aiProvider: true, aiModel: true },
    });

    const model = getLanguageModel({
      provider: user?.aiProvider as AIProvider | undefined,
      modelName: user?.aiModel ?? undefined,
    });

    // 3. Build Prompt
    const prompt = `You are a precise job description parser. Extract structured data from the job description below.

RULES:
1. "requiredSkills": List EVERY hard skill, technology, framework, methodology explicitly stated as required or essential. Include soft skills only if explicitly required (e.g., "must have strong communication"). Be exhaustive — include all tools and languages mentioned as necessary.
2. "niceToHave": List skills/qualifications marked as "nice to have", "bonus", "preferred", or "a plus". Do NOT duplicate items from requiredSkills.
3. "techStack": List ALL specific technologies, languages, frameworks, libraries, databases, cloud services, and tools mentioned anywhere in the posting (required or not). E.g. Python, FastAPI, React, PostgreSQL, Docker, GCP, etc.
4. "seniorityLevel": One of exactly: "junior", "mid", "senior", "lead", "staff", "principal". Infer from years of experience required and role scope.
5. "responsibilities": List 5–10 key responsibilities as concise bullet points (not full paragraphs). Each should be a complete, standalone action statement.
6. "companySize": One of: "startup", "scaleup", "mid", "enterprise". Infer from context clues (funding stage, team size, language used).
7. "remotePolicy": One of: "remote", "hybrid", "onsite", "not specified". Extract from the posting text only.

Job Description:
---
${posting.rawText}
---

Return ONLY a single valid JSON object. No markdown, no explanation.`;

    // 4. Generate structured response
    const extraction = await generateJsonObject({
      model,
      schema: jobPostingExtractionSchema,
      prompt,
      maxAttempts: 3,
    });

    // 5. Update job posting
    await db
      .update(jobPostings)
      .set({
        requiredSkills: JSON.stringify(extraction.requiredSkills),
        niceToHave: JSON.stringify(extraction.niceToHave),
        techStack: JSON.stringify(extraction.techStack),
        seniorityLevel: extraction.seniorityLevel,
        responsibilities: JSON.stringify(extraction.responsibilities),
        companySize: extraction.companySize,
        remotePolicy: extraction.remotePolicy,
        status: "ready",
        errorMessage: null,
        processedAt: new Date(),
      })
      .where(eq(jobPostings.id, postingId));
  } catch (error) {
    console.error("Failed to process job posting:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to process job posting";
    await db
      .update(jobPostings)
      .set({
        status: "failed",
        errorMessage: errMessage,
        processedAt: new Date(),
      })
      .where(eq(jobPostings.id, postingId));
  }
}
