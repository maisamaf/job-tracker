import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { MarketingNavClient } from "./marketing-nav-client";

export async function MarketingNav() {
  const session = await auth();

  const authCta = session?.user ? (
    <Button size="sm" asChild>
      <Link href="/dashboard">Open app →</Link>
    </Button>
  ) : (
    <Button size="sm" asChild>
      <Link href="/login">Sign in free</Link>
    </Button>
  );

  return <MarketingNavClient authCta={authCta} />;
}
