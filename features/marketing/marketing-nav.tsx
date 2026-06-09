import Link from "next/link";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { MarketingNavClient } from "./marketing-nav-client";

export async function MarketingNav() {
  const session = await auth();

  const authCta = session?.user ? (
    <Button size="sm" asChild>
      <Link href="/dashboard">Open app →</Link>
    </Button>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/dashboard" });
      }}
    >
      <Button type="submit" size="sm">
        Sign in free
      </Button>
    </form>
  );

  return <MarketingNavClient authCta={authCta} />;
}
