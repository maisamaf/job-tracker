import { FadeIn } from "./fade-in";
import { Marquee } from "@/components/ui/marquee";

const STACK: { name: string; color: string }[] = [
  { name: "Next.js 15", color: "#000000" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "shadcn/ui", color: "#18181b" },
  { name: "Drizzle ORM", color: "#c89b3c" },
  { name: "Neon Postgres", color: "#00e699" },
  { name: "NextAuth v5", color: "#6366f1" },
  { name: "Anthropic Claude", color: "#d97706" },
  { name: "Vercel AI SDK", color: "#000000" },
  { name: "TanStack Query", color: "#ef4444" },
  { name: "Recharts", color: "#6366f1" },
  { name: "Zod", color: "#f59e0b" },
  { name: "dnd-kit", color: "#8b5cf6" },
  { name: "date-fns", color: "#f97316" },
];
const firstRow = STACK.slice(0, STACK.length / 2);
const secondRow = STACK.slice(STACK.length / 2);

export function StackSection() {
  return (
    <section id="stack" className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Built with
          </p>
        </div>
        <h2 className="mb-4 text-[clamp(24px,3vw,36px)] font-semibold tracking-tight">
          A production-grade stack
        </h2>
        <p className="mb-12 max-w-md text-muted-foreground leading-relaxed">
          Next.js App Router with React Server Components, typesafe database
          access with Drizzle, and streaming AI — every choice deliberate.
        </p>

        <FadeIn>
          <div className="flex flex-wrap gap-2.5">
            <Marquee pauseOnHover={true}>
              {firstRow.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: tech.color }}
                    aria-hidden
                  />
                  {tech.name}
                </div>
              ))}
            </Marquee>
          </div>
          <Marquee pauseOnHover={true} reverse={true}>
            {secondRow.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: tech.color }}
                  aria-hidden
                />
                {tech.name}
              </div>
            ))}
          </Marquee>
        </FadeIn>
      </div>
    </section>
  );
}
