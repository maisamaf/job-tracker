export interface CandidateExperience {
  company?: string;
  role?: string;
  bullets?: string[];
}

export interface GenerateQuestionsPromptInput {
  role: string;
  company: string;
  requiredSkills: string[];
  candidate: {
    skills: string[];
    experience: CandidateExperience[];
  };
}

export function buildInterviewPrepPrompt({ role, company, requiredSkills, candidate }: GenerateQuestionsPromptInput): string {
  const candidateExperienceStr = candidate.experience
    ? candidate.experience
        .map(
          (exp: CandidateExperience) =>
            `- Company: ${exp.company || ""}, Role: ${exp.role || ""}\n  Bullets: ${
              Array.isArray(exp.bullets) ? exp.bullets.join("; ") : ""
            }`
        )
        .join("\n")
    : "None";

  return `You are a professional tech interviewer. Generate exactly 12 interview questions for the role: ${role} at ${company}.
Distribute them evenly: 3 technical, 3 behavioral, 3 role-specific, and 3 culture.
Base each suggestedAnswer on the candidate's actual CV skills and experience, rather than writing generic advice.

Required JSON shape (an array of objects):
[
  {
    "category": "technical", // must be one of: "technical", "behavioral", "role-specific", "culture"
    "question": "Describe a challenging problem you solved using React...",
    "suggestedAnswer": "Based on your experience at Company X working on Y, you could talk about how you...",
    "difficulty": "medium" // must be one of: "easy", "medium", "hard"
  }
]

Rules:
1. Respond ONLY with a single valid JSON array matching the shape above.
2. Do NOT add markdown, explanations, or commentary.
3. Keep questions relevant to:
   - REQUIRED SKILLS: ${requiredSkills.join(", ") || "None"}
   - CANDIDATE SKILLS: ${candidate.skills.join(", ") || "None"}
   - CANDIDATE EXPERIENCE:
${candidateExperienceStr}`;
}