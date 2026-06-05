"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleTextareaProps
  extends React.ComponentProps<typeof Textarea> {
  label: React.ReactNode;
  maxLength?: number;
  containerClassName?: string;
}

export function CollapsibleTextarea({
  label,
  value = "",
  onChange,
  maxLength = 300,
  className,
  containerClassName,
  id,
  style,
  ...props
}: CollapsibleTextareaProps) {
  const [expanded, setExpanded] = React.useState(false);
  const textValue = typeof value === "string" ? value : "";
  const showToggle = textValue.length > maxLength;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      <div className="flex items-center justify-between min-h-8">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Expand
              </>
            )}
          </Button>
        )}
      </div>

      <div className="relative w-full">
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          className={cn(
            className,
            !expanded &&
              showToggle &&
              ` field-sizing-fixed overflow-hidden resize-none z-0`,
          )}
          style={{
            ...style, 
            minHeight: "160px",
          }}
          {...props}
        />
        {!expanded && showToggle && (
          <span className="absolute bottom-0 inset-x-0 h-14 bg-linear-to-t from-card to-transparent" />
        )}
      </div>
    </div>
  );
}
