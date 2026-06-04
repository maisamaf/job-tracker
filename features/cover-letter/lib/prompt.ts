import type { CoverLetterTone } from "../types";

interface BuildPromptArgs {
  jobDescription: string;
  yourBackground: string;
  tone: CoverLetterTone;
  additionalContext?: string;
  company?: string;
  role?: string;
}

const TONE_INSTRUCTIONS: Record<CoverLetterTone, string> = {
  professional:
    "Write in a polished, credible, executive-level tone. Clear and direct. Avoid corporate jargon, buzzwords, and unnecessary formality.",
  conversational:
    "Write naturally and warmly, as a thoughtful professional speaking to another person. Use contractions where appropriate. Avoid sounding scripted or overly casual.",
  enthusiastic:
    "Show genuine interest in the company and role through specific observations and relevant experience. Convey energy through substance, not exclamation points or generic excitement.",
  concise:
    "Maximum 250 words. Prioritize the strongest evidence and most relevant achievements. Remove all filler and repetition.",
};

export function buildCoverLetterPrompt({
  jobDescription,
  yourBackground,
  tone,
  additionalContext,
  company,
  role,
}: BuildPromptArgs): string {
  const roleContext =
    company && role ? `Role: ${role} at ${company}` : "Role: [not specified]";

  return `You are an expert cover letter writer. Write a cover letter based on the inputs below.

${roleContext}

TONE INSTRUCTIONS:
${TONE_INSTRUCTIONS[tone]}

JOB DESCRIPTION:
${jobDescription.trim()}

CANDIDATE BACKGROUND:
${yourBackground.trim()}

${
  additionalContext?.trim()
    ? `ADDITIONAL CONTEXT:\n${additionalContext.trim()}\n`
    : ""
}
RULES:

OBJECTIVE:
Write a cover letter that sounds like it was written by a strong candidate who understands the role and can clearly explain why they are likely to succeed in it.

WRITING STYLE:
- Sound human, not corporate.
- Avoid generic cover-letter language.
- Vary sentence length and structure.
- Use specific examples whenever possible.
- Prioritize credibility over enthusiasm.
- Show evidence instead of making claims.
- Focus on outcomes, impact, and problem-solving.
- Write in active voice.

OPENING:
- Do not begin with a greeting.
- Do not begin with "I am excited to apply", "I am writing to express my interest", or similar phrases.
- Open with a relevant observation, achievement, business challenge, or connection between the candidate's experience and the role.

BODY:
- Demonstrate understanding of the company's needs using details from the job description.
- Connect the candidate's experience directly to those needs.
- Highlight 2-4 of the strongest and most relevant accomplishments.
- Explain impact using results, outcomes, scope, metrics, or business value whenever available.
- Do not simply summarize the resume.

CLOSING:
- End naturally and confidently.
- Express interest without sounding desperate or overly formal.
- Reference how the candidate could contribute to the team, company, or mission.

AVOID:
- Generic praise of the company.
- Repeating information already stated.
- Buzzwords and clichés.
- Placeholder achievements or invented metrics.
- Overly dramatic language.
- AI-sounding phrases such as:
  - "I am excited to apply"
  - "I believe I would be a great fit"
  - "With my background in"
  - "I am confident that"
  - "Passionate about"
  - "Results-driven professional"
  - "Fast-paced environment"
  - "Team player"

OUTPUT:
- Output only the cover letter body.
- No headers.
- No subject line.
- No placeholders.
- No markdown.
- No explanations.

Before finalizing the cover letter, silently evaluate:

1. Would a hiring manager believe a human wrote this?
2. Does the first paragraph establish credibility within 3 sentences?
3. Are there specific references to the job description?
4. Is every paragraph adding new information?
5. Are achievements demonstrated rather than claimed?
6. Does the letter avoid generic cover-letter language?

If any answer is "no", revise before producing the final version.

Write the cover letter now:`;
}
