import { MarketingNav } from "@/features/marketing/marketing-nav";
import { HeroSection } from "@/features/marketing/hero-section";
import { FeaturesSection } from "@/features/marketing/features-section";
import { HowSection } from "@/features/marketing/how-section";
import { StackSection } from "@/features/marketing/stack-section";
import { CtaSection } from "@/features/marketing/cta-section";
import { LandingFooter } from "@/features/marketing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <HeroSection />
      <FeaturesSection />
      <HowSection />
      <StackSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
