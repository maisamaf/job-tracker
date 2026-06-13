"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JobPosting } from "@/lib/db/schema";
import { Building, MapPin, Briefcase } from "lucide-react";

interface PostingDetailProps {
  posting: JobPosting;
}

export function PostingDetail({ posting }: PostingDetailProps) {
  const requiredSkills: string[] = posting.requiredSkills ? JSON.parse(posting.requiredSkills) : [];
  const niceToHave: string[] = posting.niceToHave ? JSON.parse(posting.niceToHave) : [];
  const techStack: string[] = posting.techStack ? JSON.parse(posting.techStack) : [];
  const responsibilities: string[] = posting.responsibilities ? JSON.parse(posting.responsibilities) : [];

  return (
    <div className="space-y-6">
      {/* Badges bar */}
      <div className="flex flex-wrap gap-2 animate-fade-in">
        {posting.seniorityLevel && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            Seniority: {posting.seniorityLevel}
          </Badge>
        )}
        {posting.remotePolicy && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Policy: {posting.remotePolicy}
          </Badge>
        )}
        {posting.companySize && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5" />
            Company: {posting.companySize}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Skills */}
        {requiredSkills.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((skill) => (
                  <Badge key={skill} variant="default" className="bg-primary/95 text-primary-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nice to Have */}
        {niceToHave.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-3">Nice to Have</h4>
              <div className="flex flex-wrap gap-1.5">
                {niceToHave.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-muted text-muted-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-3">Tech Stack & Tools</h4>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="border-primary/30 text-primary-foreground/90 bg-primary/5">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responsibilities */}
        {responsibilities.length > 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-3">Core Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                {responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Raw Description */}
      {posting.rawText && (
        <section className="mt-6 border-t pt-6">
          <h4 className="font-semibold text-sm mb-3 text-foreground">Scraped Job Description</h4>
          <div className="rounded-lg border bg-muted/10 px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
            {posting.rawText}
          </div>
        </section>
      )}
    </div>
  );
}
