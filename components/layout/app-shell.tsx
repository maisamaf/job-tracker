import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4 md:p-6">
        <AppHeader />
        <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">

            <div className="container mx-auto max-w-7xl">
              {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
