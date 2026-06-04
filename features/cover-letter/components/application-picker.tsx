"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  company: string;
  role: string;
}

interface ApplicationPickerProps {
  applications: Application[];
  value: string;
  onChange: (value: string) => void;
}

export function ApplicationPicker({
  applications,
  value,
  onChange,
}: ApplicationPickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="max-w-full">
        <SelectValue placeholder="Select application (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No application — standalone letter</SelectItem>
        {applications.map((app) => (
          <SelectItem key={app.id} value={app.id}>
            {app.role} at {app.company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
