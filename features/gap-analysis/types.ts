import { z } from "zod";

export const gapAnalysisSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  skillMatchScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  partialSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
  summary: z.string(),
});

export type GapAnalysisResult = z.infer<typeof gapAnalysisSchema>;
