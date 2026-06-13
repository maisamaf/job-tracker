"use client";

import { KeyboardEvent, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillsTagInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SkillsTagInput({
  value,
  onChange,
  placeholder = "Add a skill…",
  disabled = false,
  className,
}: SkillsTagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input.value);
      input.value = "";
      return;
    }

    if (e.key === "Backspace" && input.value === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const tag = e.currentTarget.value.trim();
    if (tag) {
      addTag(tag);
      e.currentTarget.value = "";
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 px-3 py-2 min-h-10",
        "border border-input bg-transparent rounded-md shadow-xs",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((skill, index) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-sm rounded-md bg-secondary text-secondary-foreground"
        >
          {skill}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="hover:text-foreground transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        className="flex-1 min-w-24 text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
}
