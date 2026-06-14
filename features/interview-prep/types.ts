import { z } from "zod";

export const generatedQuestionSchema = z.object({
  category: z.enum(["technical", "behavioral", "role-specific", "culture"]),
  question: z.string(),
  suggestedAnswer: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const generatedQuestionsListSchema = z.array(generatedQuestionSchema);

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
