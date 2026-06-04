import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, LayoutList, BarChart3 } from "lucide-react";

const ACTIONS = [
  {
    label: "Add application",
    href: "/applications/new",
    icon: Plus,
    variant: "default" as const,
  },
  {
    label: "Generate cover letter",
    href: "/cover-letter",
    icon: Sparkles,
    variant: "outline" as const,
  },
  {
    label: "View all applications",
    href: "/applications",
    icon: LayoutList,
    variant: "outline" as const,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Button
          key={action.href}
          variant={action.variant}
          size="sm"
          asChild
          className="gap-1.5"
        >
          <Link href={action.href}>
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
