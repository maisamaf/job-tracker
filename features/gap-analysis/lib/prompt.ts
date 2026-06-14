export interface CandidateExperience {
  company?: string;
  role?: string;
  years?: string | number;
  bullets?: string[];
}

export interface GapAnalysisPromptInput {
  candidate: {
    skills: string[];
    experience: CandidateExperience[];
    summary: string;
    cvRawText?: string;
  };
  job: {
    requiredSkills: string[];
    niceToHave: string[];
    seniorityLevel: string;
    techStack: string[];
    responsibilities?: string[];
    rawText?: string;
    role?: string;
    company?: string;
  };
}

export function buildGapAnalysisPrompt({ candidate, job }: GapAnalysisPromptInput): string {
  const candidateExperienceStr = candidate.experience?.length
    ? candidate.experience
        .map(
          (exp: CandidateExperience) =>
            `• ${exp.role || "Unknown role"} at ${exp.company || "Unknown company"} (${exp.years || "?"} yrs)\n  ${
              Array.isArray(exp.bullets) && exp.bullets.length > 0
                ? exp.bullets.join("; ")
                : "No details"
            }`
        )
        .join("\n")
    : "None provided";

  const requiredSkillsList = job.requiredSkills?.length
    ? job.requiredSkills.join(", ")
    : "See job description";

  const niceToHaveList = job.niceToHave?.length
    ? job.niceToHave.join(", ")
    : "None specified";

  const techStackList = job.techStack?.length
    ? job.techStack.join(", ")
    : "See job description";

  const responsibilitiesStr = job.responsibilities?.length
    ? job.responsibilities.map((r) => `• ${r}`).join("\n")
    : "See job description";

  // Build context sections — use raw texts as primary source if available
  const candidateSection = candidate.cvRawText
    ? `CANDIDATE CV (full text):\n---\n${candidate.cvRawText.slice(0, 6000)}\n---`
    : `CANDIDATE PROFILE:
Skills listed: ${candidate.skills.join(", ") || "None"}
Summary: ${candidate.summary || "None"}
Experience:
${candidateExperienceStr}`;

  const jobSection = job.rawText
    ? `JOB DESCRIPTION (full text):\n---\n${job.rawText.slice(0, 6000)}\n---\n\nExtracted structured fields (use as cross-reference only):
Role: ${job.role || "Not specified"}
Company: ${job.company || "Not specified"}
Seniority: ${job.seniorityLevel || "Not specified"}
Required skills: ${requiredSkillsList}
Nice to have: ${niceToHaveList}
Tech stack: ${techStackList}`
    : `JOB POSTING:
Role: ${job.role || "Not specified"}
Company: ${job.company || "Not specified"}
Seniority: ${job.seniorityLevel || "mid"}
Required skills: ${requiredSkillsList}
Nice to have: ${niceToHaveList}
Tech stack: ${techStackList}
Responsibilities:
${responsibilitiesStr}`;

  return `You are a senior technical recruiter performing a precise, deterministic candidate-to-job-fit analysis.

Your task: Compare the candidate's background against the job requirements and produce a structured JSON assessment.

CRITICAL RULES FOR SKILL CATEGORIZATION (follow exactly — no exceptions):
1. Extract ALL skills/technologies mentioned anywhere in the job description (required, nice-to-have, tech stack, responsibilities).
2. For each job skill, assign it to EXACTLY ONE of these buckets:
   - "matchedSkills": Candidate explicitly lists this skill OR their CV clearly demonstrates it.
   - "partialSkills": Candidate has a closely related skill (e.g., has React but job wants Vue, has Python but job wants Django specifically, has Docker but not Kubernetes).
   - "missingSkills": Candidate shows no evidence of this skill anywhere in their profile.
3. Every skill mentioned in the job description MUST appear in one of the three lists. No skill should be omitted.
4. Normalize skill names (e.g., "Node.js" and "NodeJS" are the same). Use the job's naming convention.
5. Be conservative: only put something in "matchedSkills" if there is clear evidence. When in doubt, use "partialSkills".

SCORING RULES:
- "skillMatchScore" (0–100): Percentage of required+tech-stack skills that are matched or partial (matched = full credit, partial = 50% credit).
- "experienceScore" (0–100): How well the candidate's years and type of experience match the seniority, scope, and domain of the role.
- "overallMatchScore" (0–100): Weighted average — skills (60%) + experience (40%).
- Scores must be consistent with the skill breakdown. If 8/10 skills match, skillMatchScore should be ~80.

RECOMMENDATIONS: Provide 3–5 specific, actionable recommendations. Reference actual skill gaps. Be concrete (e.g., "Build a project with FastAPI" not "Learn backend").

SUMMARY: Write 2–3 sentences that are honest and specific about fit strength and key gaps.

${candidateSection}

${jobSection}

Respond ONLY with a single valid JSON object. No markdown, no explanation.

Required JSON shape:
{
  "overallMatchScore": 72,
  "skillMatchScore": 80,
  "experienceScore": 65,
  "matchedSkills": ["TypeScript", "React", "Node.js"],
  "missingSkills": ["FastAPI", "Kubernetes"],
  "partialSkills": ["Python (listed but no web framework)"],
  "recommendations": [
    "Build a REST API project using FastAPI to demonstrate Python backend proficiency.",
    "Complete a Docker + Kubernetes deployment tutorial to close the DevOps gap."
  ],
  "summary": "Strong frontend engineer with solid TypeScript and React expertise. Main gaps are Python backend frameworks and cloud infrastructure which are key requirements for this role."
}`;
}