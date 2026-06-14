"use client";

import { User, FileText, Bot } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountSettingsForm } from "./account-settings-form";
import { ProfileSettingsForm } from "./profile-settings-form";
import { AiSettingsForm } from "./ai-settings-form";

// Types 

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    aiProvider: string | null;
    aiModel: string | null;
    embeddingDimensions: number | null;
  };
  profile: {
    cvRawText: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
    languages: string | null;
    summary: string | null;
  } | null;
}

// Component 

export function SettingsView({ user, profile }: SettingsViewProps) {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, profile, and AI preferences.
        </p>
      </div>

      <Tabs
        defaultValue="account"
        orientation="vertical"
        className="items-start gap-6"
      >
        <TabsList variant="line" className="w-44 shrink-0 gap-0.5">
          <TabsTrigger value="account" className="gap-2">
            <User className="size-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <FileText className="size-4" />
            Profile & CV
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="size-4" />
            AI Model
          </TabsTrigger>
        </TabsList>

        {/* Account  */}
        <TabsContent value="account">
          <AccountSettingsForm user={user} />
        </TabsContent>

        {/* Profile & CV  */}
        <TabsContent value="profile">
          <ProfileSettingsForm
            userAiProvider={user.aiProvider}
            userAiModel={user.aiModel}
            profile={profile}
          />
        </TabsContent>

        {/* AI Model  */}
        <TabsContent value="ai">
          <AiSettingsForm user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
