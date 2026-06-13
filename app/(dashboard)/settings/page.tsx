import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getProfile } from "@/features/profile/actions/get-profile";
import { SettingsView } from "@/features/settings/components/settings-view";

export const metadata: Metadata = { title: "Settings — JobTrackr" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, profile] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        aiProvider: true,
        aiModel: true,
        embeddingDimensions: true,
      },
    }),
    getProfile(),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="px-4 pb-12 md:px-6">
      <SettingsView user={user} profile={profile ?? null} />
    </div>
  );
}
