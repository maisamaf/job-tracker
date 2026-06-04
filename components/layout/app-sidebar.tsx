"use client";

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
import { LayersIcon as LogoIcon } from "./logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild>
          <Link href="/">
            <LogoIcon />
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
  );
}
