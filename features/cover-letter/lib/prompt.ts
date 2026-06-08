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
  return ` You are helping a strong candidate explain why they are likely to succeed in this role. Write a short persuasive message to a hiring manager. The reader should feel they are hearing from a capable professional, not reading a template. 
  ${roleContext} 
  
  TONE INSTRUCTIONS: 
  ${TONE_INSTRUCTIONS[tone]} 
  
  JOB DESCRIPTION: 
  ${jobDescription.trim()} 
  
  CANDIDATE BACKGROUND: 
  ${yourBackground.trim()} 
  ${additionalContext?.trim() ? `ADDITIONAL CONTEXT: ${additionalContext.trim()} ` : ""}


OBJECTIVE

Explain:

1. Why the candidate understands the role.
2. Which experiences best predict success.
3. What value the candidate could bring to the team or business.

GENERAL PRINCIPLES

- Sound human, not corporate.
- Prioritize credibility over enthusiasm.
- Show evidence instead of making claims.
- Focus on outcomes, impact, ownership, and problem-solving.
- Write in active voice.
- Vary sentence length and structure.
- Use specific examples whenever possible.
- Prefer concrete nouns and verbs over abstract adjectives.
- Remove anything that does not strengthen the message.
- Every paragraph must earn its place.
- Assume the hiring manager is busy.

WRITING STYLE

Prefer:

"Built internal tools used by 300 employees and reduced support requests."

Over:

"Experienced engineer with strong communication skills."

Prefer demonstrated achievements over self-descriptions.

Avoid empty adjectives such as:

- passionate
- results-driven
- dynamic
- hardworking
- team player

unless they are supported by evidence.

OPENING

- Do not begin with a greeting.
- Do not begin with generic application phrases.
- Establish credibility within the first 2-3 sentences.
- Open with a relevant achievement, business challenge, observation, or direct connection between the candidate's experience and the role.

BODY

- Demonstrate understanding of the company's needs using details from the job description.
- Connect the candidate's experience directly to those needs.
- Highlight the 2-4 strongest and most relevant accomplishments.
- Explain impact using scope, results, metrics, business value, or outcomes whenever available.
- Do not simply summarize the resume.
- Introduce new information in each paragraph.
- Prefer depth over listing many unrelated achievements.

COMPANY REFERENCES

- Only reference information explicitly present in the job description or additional context.
- Never pretend prior familiarity with the company.
- Avoid generic praise.

CLOSING

- End naturally and confidently.
- Express interest without sounding desperate.
- Briefly reinforce how the candidate could contribute.

IMPORTANT

- Do not invent achievements, metrics, technologies, or experiences.
- If information is missing, omit it rather than guessing.
- Avoid repeating information already stated.
- Avoid clichés and buzzwords.
- Avoid sounding like a traditional cover letter template.
- Write more like a thoughtful email from one professional to another.

OUTPUT

- Output only the cover letter body.
- No headers.
- No subject line.
- No placeholders.
- No markdown.
- No explanations.

Before finalizing, silently evaluate:

1. Would a hiring manager believe a human wrote this?
2. Does the opening establish credibility quickly?
3. Are specific job requirements addressed?
4. Is every paragraph adding new information?
5. Are achievements demonstrated rather than claimed?
6. Is anything repetitive or unnecessary?
7. Would this still sound strong if company names were removed?
8. Does the message feel like a professional conversation rather than a template?

If any answer is "no", revise before producing the final version.

Write the message now.`;
}
