import {
  Briefcase,
  Kanban,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./fade-in";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  span: string;
  featured?: boolean;
  index: string;
}[] = [
  {
    icon: Sparkles,
    title: "AI cover letters that actually get read",
    description:
      "Paste the job description, describe your background, pick a tone — AI streams back a tailored letter in seconds. Saved to the application, editable any time.",
    span: "md:col-span-2",
    featured: true,
    index: "01",
  },
  {
    icon: Briefcase,
    title: "Every application in one place",
    description:
      "Log company, role, salary, and job URL in under a minute. Filter by status, search by keyword, paginate with ease.",
    span: "md:col-span-1",
    index: "02",
  },
  {
    icon: Kanban,
    title: "Drag-and-drop pipeline",
    description:
      "Move cards through Bookmarked → Applying → Applied → Interviewing → Offered. Optimistic updates — no waiting for the server.",
    span: "md:col-span-1",
    index: "03",
  },
  {
    icon: BarChart3,
    title: "Know what's working",
    description:
      "Response rate, offer rate, stage conversion, and weekly trends — all computed automatically from your activity. No manual data entry ever.",
    span: "md:col-span-2",
    featured: true,
    index: "04",
  },
  {
    icon: Users,
    title: "Your hiring team, organized",
    description:
      "Attach recruiters and hiring managers to each role. Log every interview round with type, date, notes, and outcome.",
    span: "md:col-span-1",
    index: "05",
  },
  {
    icon: Clock,
    title: "Full audit trail",
    description:
      "Every status change logged automatically. Per-application history on the detail page, plus a global activity feed filterable by date.",
    span: "md:col-span-2",
    index: "06",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* Header */}
        <FadeIn className="mb-16">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Features
            </p>
          </div>
          <h2 className="mb-4 max-w-xl text-balance font-heading text-[clamp(28px,3.5vw,42px)] font-semibold leading-[1.15] tracking-tight">
            Everything your job search actually needs
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Built for clarity — not another spreadsheet you&apos;ll abandon in a
            week.
          </p>
        </FadeIn>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeIn
              key={feature.title}
              delay={i * 60}
              className={cn("h-full", feature.span)}
            >
              <div
                className={cn(
                  "group relative h-full overflow-hidden rounded-2xl border p-8 transition-all duration-300",
                  feature.featured
                    ? "border-foreground/12 bg-foreground hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
                    : "bg-card hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/6",
                )}
              >
                {/* Decorative index number */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -bottom-2 right-6 select-none font-black leading-none tabular-nums",
                    feature.featured
                      ? "text-[6.5rem] text-background/8"
                      : "text-[6.5rem] text-foreground/5",
                  )}
                >
                  {feature.index}
                </span>

                {/* Icon */}
                <div
                  className={cn(
                    "mb-6 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                    feature.featured
                      ? "bg-background/10 group-hover:bg-background/15"
                      : "bg-muted group-hover:bg-primary/10",
                  )}
                >
                  <feature.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-300",
                      feature.featured
                        ? "text-background"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                </div>

                {/* Text */}
                <h3
                  className={cn(
                    "mb-2.5 text-base font-semibold leading-snug",
                    feature.featured ? "text-background" : "text-foreground",
                  )}
                >
                  {feature.title}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    feature.featured
                      ? "text-background/60"
                      : "text-muted-foreground",
                  )}
                >
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
