"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApplicationPicker } from "./application-picker";
import { uploadCoverLetter } from "../actions/upload-cover-letter";
import {
  ALLOWED_COVER_LETTER_MIME_TYPES,
  COVER_LETTER_FILE_ACCEPT,
  MAX_COVER_LETTER_FILE_SIZE,
} from "../lib/upload-constraints";
import { formatFileSize, cn } from "@/lib/utils";
import { Check, Save, AlertTriangle, UploadCloud, FileText, X } from "lucide-react";

interface Application {
  id: string;
  company: string;
  role: string;
}

interface UploadCoverLetterFormProps {
  applications: Application[];
  defaultApplicationId?: string;
}

export function UploadCoverLetterForm({
  applications,
  defaultApplicationId,
}: UploadCoverLetterFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedAppId, setSelectedAppId] = useState(
    defaultApplicationId ?? "none",
  );
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleAppChange(appId: string) {
    setSelectedAppId(appId);
    setSaved(false);
  }

  function validateAndSetFile(candidate: File) {
    setSaveError(null);
    setSaved(false);
    if (!ALLOWED_COVER_LETTER_MIME_TYPES.has(candidate.type)) {
      setSaveError("Only PDF and Word documents (.pdf, .doc, .docx) are supported");
      return;
    }
    if (candidate.size > MAX_COVER_LETTER_FILE_SIZE) {
      setSaveError("File is too large (max 5MB)");
      return;
    }
    setFile(candidate);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const candidate = e.target.files?.[0];
    if (candidate) validateAndSetFile(candidate);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const candidate = e.dataTransfer.files?.[0];
    if (candidate) validateAndSetFile(candidate);
  }

  function clearFile() {
    setFile(null);
    setSaved(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.set("file", file);
    if (selectedAppId !== "none") {
      formData.set("applicationId", selectedAppId);
    }

    const result = await uploadCoverLetter(formData);

    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaved(true);
      setFile(null);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <Label>Link to application</Label>
        <ApplicationPicker
          applications={applications}
          value={selectedAppId}
          onChange={handleAppChange}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Cover letter file</Label>

        {file ? (
          <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearFile}
              disabled={saving}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50",
            )}
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop a file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF or Word document, up to 5MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={COVER_LETTER_FILE_ACCEPT}
              className="sr-only"
              onChange={handleFileInputChange}
            />
          </div>
        )}
      </div>

      {saveError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive flex items-start gap-2.5">
          <AlertTriangle className="size-4.5 mt-0.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive/90 leading-relaxed">
            {saveError}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!file || saving || saved}
          className="gap-2"
          size="lg"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save cover letter"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
