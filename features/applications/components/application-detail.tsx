"use client";

import { useState } from "react";
import { ApplicationHeader } from "./application-header";
import { NotesSection } from "./notes-section";
import { ContactsSection } from "./contacts-section";
import { ActivitySection } from "./activity-section";
import type { ApplicationDetail } from "../actions/get-application";
import { CoverLettersSection } from "./cover-letters-section";
import { GapAnalysisView } from "@/features/gap-analysis/components/gap-analysis-view";
import { InterviewPrepView } from "@/features/interview-prep/components/category-tabs";
import { ApplicationTimeline } from "./application-timeline";
import { CollapsibleTextarea } from "@/components/ui/collapsible-textarea";
import { getCleanJobDescription } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus, CalendarDays } from "lucide-react";
import { AddContactDialog } from "./contacts-section";
import { AddInterviewDialog } from "./interviews-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "process", label: "Process" },
  { value: "interview-prep", label: "Interview Prep" },
] as const;

type Tab = typeof TABS[number]["value"];

interface ApplicationDetailProps {
  application: ApplicationDetail;
}

export function ApplicationDetailView({ application }: ApplicationDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="max-w-5xl pb-16">
      <ApplicationHeader application={application} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)} className="lg:col-span-2 flex flex-col gap-6">
          <TabsList variant="line" className="mb-6">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <GapAnalysisView
              applicationId={application.id}
              initialDescription={application.description}
              initialJobUrl={application.jobUrl}
            />
            {(() => {
              const cleanDesc = getCleanJobDescription(
                application.description,
                application.jobPosting?.rawText,
              );
              return cleanDesc ? (
                <CollapsibleTextarea
                  label={<h2 className="text-sm font-semibold">Job Description</h2>}
                  value={cleanDesc}
                  readOnly
                />
              ) : null;
            })()}
          </TabsContent>

          <TabsContent value="process" className="space-y-4">
            <ApplicationTimeline application={application} />

            {/* Cover letters */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="px-5 pt-5 pb-4">
                <CoverLettersSection
                  applicationId={application.id}
                  coverLetters={application.coverLetters}
                />
              </div>
            </div>

            {/* Contacts */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="px-5 pt-5 pb-4">
                <ContactsSection
                  applicationId={application.id}
                  contacts={application.contacts}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interview-prep" className="space-y-6">
            <InterviewPrepView
              applicationId={application.id}
              isTabActive={activeTab === "interview-prep"}
            />
          </TabsContent>
        </Tabs>

        {/* Right column — sidebar */}
        <div className="flex flex-col gap-8">
          <NotesSection
            applicationId={application.id}
            initialNotes={application.notes}
          />

          {activeTab === "overview" && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <h3 className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start gap-2.5 text-sm" asChild>
                  <Link href={`/cover-letter?applicationId=${application.id}`}>
                    <Sparkles className="size-4 text-muted-foreground" />
                    Generate Cover Letter
                  </Link>
                </Button>

                <AddContactDialog
                  applicationId={application.id}
                  trigger={
                    <Button variant="outline" className="w-full justify-start gap-2.5 text-sm">
                      <UserPlus className="size-4 text-muted-foreground" />
                      Add Contact
                    </Button>
                  }
                />

                <AddInterviewDialog
                  applicationId={application.id}
                  trigger={
                    <Button variant="outline" className="w-full justify-start gap-2.5 text-sm">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      Log Interview
                    </Button>
                  }
                />
              </div>
            </div>
          )}

          <ActivitySection log={application.activityLog} />
        </div>
      </div>
    </div>
  );
}