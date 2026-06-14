import { z } from "zod";

export const jobPostingExtractionSchema = z.object({
  requiredSkills: z.array(z.string()).describe("Key required technical/professional skills"),
  niceToHave: z.array(z.string()).describe("Optional or nice-to-have skills/qualifications"),
  techStack: z.array(z.string()).describe("Programming languages, frameworks, databases, tools mentioned"),
  seniorityLevel: z.string().describe("Estimated seniority level e.g. 'junior', 'mid', 'senior'"),
  responsibilities: z.array(z.string()).describe("Core responsibilities and duties of the role"),
  companySize: z.string().describe("Estimated company size e.g. 'startup', 'mid', 'enterprise'"),
  remotePolicy: z.string().describe("Remote, hybrid, or onsite policy"),
});

export type JobPostingExtraction = z.infer<typeof jobPostingExtractionSchema>;
