import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./fade-in";
import { AppMockup } from "./app-mockup";

const GithubIcon = () => (
  <svg
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      {/* Lamp effect — vertical beam + horizontal spread + glow cone */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center"
        aria-hidden
      >
        <div className="h-48 w-px bg-linear-to-b from-primary/70 via-primary/25 to-transparent" />
        <div className="-mt-px h-px w-150 max-w-full bg-linear-to-r from-transparent via-primary/55 to-transparent" />
        <div className="h-72 w-140 max-w-full bg-linear-to-b from-primary/12 via-primary/4 to-transparent blur-2xl" />
      </div>

      {/* Corner glow orbs */}
      <div
        className="pointer-events-none absolute -left-40 top-0 h-125 w-125 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 top-0 h-125 w-125 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-32 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          AI-powered · Open source · Self-hostable
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-3xl text-balance text-[clamp(40px,6vw,70px)] font-bold leading-[1.06] tracking-tight font-heading">
          Your job search, <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-primary via-primary/85 to-primary/55 bg-clip-text text-transparent">
            finally organized.
          </span>
        </h1>

        <p className="mb-2 max-w-130 text-balance text-lg text-muted-foreground leading-relaxed">
          Track every application, generate tailored cover letters with AI, and
          surface insights that improve your success rate.
        </p>
        <p className="mb-10 text-sm text-muted-foreground/80 tracking-wide mt-1">
          Free forever · Open source · MIT licensed
        </p>

        {/* CTAs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              type="submit"
              size="lg"
              className="gap-2 px-7 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="gap-2 px-6 text-sm font-semibold"
          >
            <a
              href="https://github.com/maisamaf/job-tracker.git"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              Self-host now
            </a>
          </Button>
        </div>

        {/* Trust line */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/90">
          {[
            "No credit card required",
            "GitHub login in seconds",
            "Deploy anywhere",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span
                className="h-1 w-1 rounded-full bg-green-500/70"
                aria-hidden
              />
              {item}
            </span>
          ))}
        </div>

        {/* App mockup */}
        <FadeIn className="w-full">
          <AppMockup />
        </FadeIn>
      </div>
    </section>
  );
}
