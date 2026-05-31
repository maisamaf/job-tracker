"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "./form-field";
import { createContact } from "../actions/create-contact";
import { deleteContact } from "../actions/delete-contact";
import type { ActionState } from "../schemas";
import type { Contact } from "@/lib/db";
import { Plus, Loader2, UserCircle2 } from "lucide-react";
import { LinkedinIcon } from "./linkedin-icon";
import { AtSignIcon } from "./atsign-icon";
import { TrashIcon } from "./trash-icon";

interface ContactsSectionProps {
  applicationId: string;
  contacts: Contact[];
}

const INITIAL_STATE: ActionState = {};

function AddContactDialog({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [prevSuccess, setPrevSuccess] = useState(false);
  const boundAction = createContact.bind(null, applicationId);
  const [state, action, isPending] = useActionState(boundAction, INITIAL_STATE);

  if (state.success && !prevSuccess) {
    setPrevSuccess(true);
    setOpen(false);
  } else if (!state.success && prevSuccess) {
    setPrevSuccess(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Plus className="h-3 w-3" />
          Add contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-2">
          {state.errors?.root && (
            <p className="text-xs text-destructive">{state.errors.root[0]}</p>
          )}
          <FormField id="name" label="Name" required error={state.errors?.name}>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Sarah Chen"
              disabled={isPending}
              autoFocus
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="role" label="Role" error={state.errors?.role}>
              <Input
                id="role"
                name="role"
                placeholder="e.g. Recruiter"
                disabled={isPending}
              />
            </FormField>
            <FormField id="email" label="Email" error={state.errors?.email}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="sarah@company.com"
                disabled={isPending}
              />
            </FormField>
          </div>
          <FormField
            id="linkedinUrl"
            label="LinkedIn"
            error={state.errors?.linkedinUrl}
          >
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/..."
              disabled={isPending}
            />
          </FormField>
          <FormField id="notes" label="Notes" error={state.errors?.notes}>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any context about this contact..."
              className="resize-none min-h-[80px]"
              disabled={isPending}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Save contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContactsSection({
  applicationId,
  contacts,
}: ContactsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">
          Contacts
          {contacts.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({contacts.length})
            </span>
          )}
        </h2>
        <AddContactDialog applicationId={applicationId} />
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
          <UserCircle2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No contacts yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{contact.name}</span>
                  {contact.role && (
                    <span className="text-xs text-muted-foreground">
                      {contact.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`}>
                      <AtSignIcon
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        size={14}
                      >
                        {contact.email}
                      </AtSignIcon>
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=""
                    >
                      <LinkedinIcon
                        size={14}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors underline "
                      />
                    </a>
                  )}
                </div>
                {contact.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic">
                    {contact.notes}
                  </p>
                )}
              </div>
              <form
                action={deleteContact.bind(null, contact.id, applicationId)}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <TrashIcon size={18} />
                  <span className="sr-only">Delete contact</span>
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
