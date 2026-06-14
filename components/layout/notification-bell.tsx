"use client";

import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, clearAll } = useNotifications();

  function handleClick(id: string, href?: string) {
    markRead(id);
    if (href) router.push(href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "Notifications"
          }
          size="icon"
          variant="ghost"
          className="relative"
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className={cn(
                "absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center",
                "rounded-full bg-primary text-[10px] font-bold text-primary-foreground",
                "ring-2 ring-background"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
        {/* Header row */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear all notifications"
            >
              <Trash2Icon className="size-3" />
              Clear all
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <BellIcon className="size-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n.id, n.href)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-md px-3 py-2.5 cursor-pointer",
                !n.read && "bg-primary/5"
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className={cn("text-sm font-medium leading-snug", !n.read && "text-primary")}>
                  {n.title}
                </span>
                {!n.read && (
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-snug">{n.body}</span>
              <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                {formatDistanceToNow(n.createdAt, { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
