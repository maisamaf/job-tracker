"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Sparkles,
  LayoutList,
  TrendingUp,
  Check,
  type LucideIcon,
} from "lucide-react";

const STEP_DURATION = 3500;

const STEPS: {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  bullets: string[];
}[] = [
  {
    n: "01",
    icon: PlusCircle,
    title: "Add an application",
    body: "Paste the company, role, and job description. Set a status and add private notes. Takes under a minute per role.",
    bullets: [
      "Track company, role, location, and salary",
      "Set status from Bookmarked to Applied",
      "Attach the job description and private notes",
    ],
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Generate a cover letter",
    body: "The saved job description pre-fills the AI prompt. Pick a tone, add your background, and get a tailored letter in seconds — not hours.",
    bullets: [
      "Job description auto-fills the AI form",
      "Choose tone: professional, friendly, or bold",
      "Letter saved to your application automatically",
    ],
  },
  {
    n: "03",
    icon: LayoutList,
    title: "Track your progress",
    body: "Move applications through stages as you hear back. Log interviews, add contacts, and keep your pipeline clean without extra maintenance.",
    bullets: [
      "Drag cards through the Kanban pipeline",
      "Log each interview round with type and notes",
      "Attach recruiters and hiring managers per role",
    ],
  },
  {
    n: "04",
    icon: TrendingUp,
    title: "Spot what's working",
    body: "Analytics show your response rate, slowest stages, and funnel conversion — so you can improve your approach with each new application.",
    bullets: [
      "Response rate and offer rate at a glance",
      "Identify which stages take the longest",
      "Weekly trends to spot what's improving",
    ],
  },
];

export function HowSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setActive((prev) => (prev + 1) % STEPS.length),
      STEP_DURATION,
    );
    return () => clearTimeout(id);
  }, [active]);

  return (
    <section id="how" className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
        </div>
        <h2 className="mb-12 max-w-xl text-balance text-[clamp(24px,3vw,36px)] font-semibold tracking-tight font-heading">
          From discovery to offer, tracked
        </h2>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          {/* ── Left: vertical step list ── */}
          <div>
            {STEPS.map((step, i) => (
              <button
                key={step.n}
                onClick={() => setActive(i)}
                className="w-full text-left"
                aria-pressed={i === active}
              >
                <div className="flex gap-4">
                  {/* Circle + connector */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                        i < active
                          ? "border-primary bg-primary text-primary-foreground"
                          : i === active
                            ? "border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.08)]"
                            : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {i < active ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mt-1 min-h-10 w-px flex-1 transition-colors duration-500",
                          i < active ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>

                  {/* Label + progress bar */}
                  <div
                    className={cn(
                      "flex-1 pb-8",
                      i === STEPS.length - 1 && "pb-0",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        i === active
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    {i === active && (
                      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          key={`prog-${active}`}
                          className="h-full rounded-full bg-primary"
                          style={{
                            animation: `step-progress ${STEP_DURATION}ms linear forwards`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Right: animated content panel ── */}
          <div className="relative h-90">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  i === active
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-8">
                  {/* Icon */}
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Step label */}
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Step {step.n}
                  </p>

                  <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>

                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>

                  {/* Bullet list */}
                  <ul className="mt-auto space-y-2.5">
                    {step.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
