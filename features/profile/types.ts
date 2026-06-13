export interface Experience {
  company: string;
  role: string;
  years: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedCV {
  skills: string[];
  experience: Experience[];
  education: Education[];
  summary: string;
}
