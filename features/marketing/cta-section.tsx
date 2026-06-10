import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { FadeIn } from "./fade-in";

export function CtaSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-[clamp(24px,3vw,34px)] font-semibold tracking-tight text-balance font-heading">
            Two ways to get started
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Use the hosted version for free, or deploy it yourself on your own
            infrastructure.
          </p>
        </div>

        <FadeIn>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1 — Cloud */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
              <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">JobTrackr Cloud</h3>
                <p className="mb-6 text-sm leading-relaxed text-primary-foreground/75">
                  The fastest way to start. Sign in with GitHub and you&apos;re
                  tracking applications within minutes.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {[
                    "Free to test — no credit card",
                    "Sign in with GitHub in seconds",
                    "AI cover letter generation",
                    "Analytics & kanban pipeline",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check className="h-4 w-4 shrink-0 opacity-80" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link href="/login">Get started free</Link>
                </Button>
              </div>
            </div>

            {/* Card 2 — Self-host */}
            <div className="relative overflow-hidden rounded-2xl border bg-card p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Self-host</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Own your data. Deploy on Vercel, Railway, or any Node.js host.
                Open source and MIT licensed.
              </p>
              <ul className="mb-8 space-y-2.5">
                {[
                  "Full source code on GitHub",
                  "Your own database — own your data",
                  "One-click Vercel deploy",
                  "MIT licensed — use it your way",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                asChild
              >
                <a
                  href="https://github.com/maisamaf/job-tracker.git"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
