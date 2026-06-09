"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import {
  footerNavLinks,
  isNavItemActive,
  navGroups,
} from "@/components/layout/app-shared";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchDialog } from "@/features/applications/components/search-dialog";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K shortcut
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  return (
    <>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader className="h-14 justify-center">
          <SidebarMenuButton asChild>
            <Link href="/">
              <Logo />
            </Link>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                tooltip="Add application"
                onClick={() => router.push("/applications/new")}
              >
                <PlusIcon />
                <span>Add application</span>
              </SidebarMenuButton>
              <Button
                aria-label="Search applications"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                size="icon"
                variant="outline"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
                <span className="sr-only">Search applications</span>
              </Button>
            </SidebarMenuItem>
          </SidebarGroup>
          {navGroups.map((group, index) => (
            <NavGroup key={`sidebar-group-${index}`} {...group} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu className="mt-2">
            {footerNavLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-muted-foreground"
                  isActive={isNavItemActive(pathname, item.path)}
                  size="default"
                >
                  <a href={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
