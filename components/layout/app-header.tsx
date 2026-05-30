"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumb";
import { CustomSidebarTrigger } from "@/components/layout/custom-sidebar-trigger";
import { isNavItemActive, navLinks } from "@/components/layout/app-shared";
import { NavUser } from "@/components/layout/nav-user";
import { BellIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const activeItem = navLinks.find((item) =>
    isNavItemActive(pathname, item.path),
  );
  return (
    <header
      className={cn(
        "pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2",
      )}
    >
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs page={activeItem} />
      </div>
      <div className="flex items-center gap-3">
        <Button aria-label="Notifications" size="icon" variant="ghost">
          <BellIcon />
        </Button>
        <Separator
          className="h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <NavUser />
      </div>
    </header>
  );
}
