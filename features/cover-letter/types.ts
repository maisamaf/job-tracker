export type CoverLetterTone =
  | "professional"
  | "conversational"
  | "enthusiastic"
  | "concise"

export interface CoverLetterFormInput {
  applicationId?: string
  jobDescription: string
  yourBackground: string
  tone: CoverLetterTone
  additionalContext?: string
}

export const TONE_CONFIG: Record<CoverLetterTone,
  { label: string; description: string }> = {
  professional: {
    label: "Professional",
    description: "Formal, structured, polished",
  },
  conversational: {
    label: "Conversational",
    description: "Warm, natural, approachable",
  },
  enthusiastic: {
    label: "Enthusiastic",
    description: "Energetic, passionate, forward-looking",
  },
  concise: {
    label: "Concise",
    description: "Direct and to the point — under 250 words",
  },
}

export const TONE_OPTIONS = Object.keys(TONE_CONFIG) as CoverLetterTone[]