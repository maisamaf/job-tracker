import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";

const FEATURES = [
  "Track every application in one place",
  "Generate AI-powered cover letters",
  "Visual kanban pipeline & analytics",
  "Open source and self-hostable",
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-105 xl:w-120 shrink-0 flex-col justify-between bg-primary p-10">
        <Link href="/" className="w-fit">
          <Logo size={22} className="text-primary-foreground" />
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground leading-tight">
              Your job search,
              <br />
              finally organized.
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Track applications, generate tailored cover letters with AI, and
              surface insights that improve your success rate.
            </p>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-primary-foreground/85"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 opacity-60" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/40">
          Free forever · MIT licensed · Open source
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Top bar: mobile logo + back link */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="lg:hidden">
            <Logo size={20} />
          </Link>
          <Link
            href="/"
            className="mr-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Form content area */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-90">{children}</div>
        </div>
      </div>
    </div>
  );
}
