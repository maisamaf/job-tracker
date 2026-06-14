"use client";

import { Textarea } from "@/components/ui/textarea";

interface AnswerEditorProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export function AnswerEditor({ value, onChange, onBlur, disabled }: AnswerEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder="Write your answer draft here. Click outside to save..."
      rows={4}
      className="text-sm leading-relaxed"
    />
  );
}
