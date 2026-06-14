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
import { usePathname } from "next/navigation";
import { SearchDialog } from "@/features/applications/components/search-dialog";
import { QuickCreateDialog } from "@/features/applications/components/quick-create-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function AppSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Global ⌘K / Ctrl+K → search   |   ⌘J / Ctrl+J → quick add
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    } else if (e.key === "j") {
      e.preventDefault();
      setQuickCreateOpen((prev) => !prev);
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
            <TooltipProvider>
              <SidebarMenuItem className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className=" bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                      tooltip="Add application (⌘J)"
                      onClick={() => setQuickCreateOpen(true)}
                    >
                      <PlusIcon />
                      <span>Add application</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Quick add application
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>J</Kbd>
                    </KbdGroup>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Search applications (⌘K)"
                      className="size-8 group-data-[collapsible=icon]:opacity-0"
                      size="icon"
                      variant="outline"
                      onClick={() => setSearchOpen(true)}
                    >
                      <SearchIcon />
                      <span className="sr-only">Search applications</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    Search applications
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>K</Kbd>
                    </KbdGroup>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </TooltipProvider>
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
      <QuickCreateDialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen} />
    </>
  );
}

