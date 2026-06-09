import { Logo } from "@/components/layout/logo";
const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Stack", href: "#stack" },
  { label: "GitHub", href: "https://github.com/maisamaf/job-tracker.git", external: true },
];

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-2">
          <Logo size={24} />
        </div>

        <nav className="flex items-center gap-5">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          Built with 💚 by{" "}
          <a
            href="https://maisam.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            Maisam
          </a>
        </p>
      </div>
    </footer>
  );
}
