// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
      <TooltipProvider>
        <AppShell>
          {children}
        </AppShell>
      </TooltipProvider>
  );
}
