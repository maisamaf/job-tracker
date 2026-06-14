"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserSettings } from "@/features/settings/actions/update-user-settings";

interface AccountSettingsFormProps {
  user: {
    name: string;
    email: string;
  };
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [name, setName] = useState(user.name);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountPending, startAccountTransition] = useTransition();

  function handleAccountSave() {
    setAccountError(null);
    startAccountTransition(async () => {
      try {
        await updateUserSettings({ name: name.trim() });
        setAccountSaved(true);
        setTimeout(() => setAccountSaved(false), 3000);
      } catch (e) {
        setAccountError(
          e instanceof Error ? e.message : "Failed to save changes.",
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Update your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={accountPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Your email address cannot be changed here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAccountSave}
            disabled={accountPending || !name.trim()}
          >
            {accountPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : accountSaved ? (
              <>
                <Check className="size-4 text-white" />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>

          {accountError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {accountError}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
