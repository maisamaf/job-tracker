import type { ReactNode } from "react";
import { HelpCircle, Settings, LayoutDashboard, Briefcase, Kanban, Sparkles, BarChart3, History } from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	subItems?: SidebarNavItem[];
};

export function isNavItemActive(pathname: string, path?: string) {
	if (!path) return false;
	if (path === "/") return pathname === "/";
	return pathname === path || pathname.startsWith(`${path}/`);
}

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
      { title: "Applications", path: "/applications", icon: <Briefcase /> },
      { title: "Board", path: "/board", icon: <Kanban /> },
      { title: "Cover Letters", path: "/cover-letter", icon: <Sparkles /> },
      { title: "Analytics", path: "/analytics", icon: <BarChart3 /> },
      { title: "Activity", path: "/activity", icon: <History /> },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [
  { title: "Settings", path: "/settings", icon: <Settings /> },
  { title: "Help", path: "/help", icon: <HelpCircle /> },
];


export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
