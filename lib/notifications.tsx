"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href?: string;
  createdAt: Date;
  read: boolean;
}

type Action =
  | { type: "PUSH"; notification: AppNotification }
  | { type: "MARK_READ"; id: string }
  | { type: "CLEAR_ALL" };

interface NotificationsState {
  notifications: AppNotification[];
}

function reducer(state: NotificationsState, action: Action): NotificationsState {
  switch (action.type) {
    case "PUSH":
      return {
        notifications: [action.notification, ...state.notifications].slice(0, 50),
      };
    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "CLEAR_ALL":
      return { notifications: [] };
    default:
      return state;
  }
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  push: (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (ascending arpeggio)
    const noteDelays = [0, 0.08, 0.16];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + noteDelays[index]);

      // Soft envelope: quick attack, smooth exponential decay
      gainNode.gain.setValueAtTime(0, now + noteDelays[index]);
      gainNode.gain.linearRampToValueAtTime(0.12, now + noteDelays[index] + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteDelays[index] + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + noteDelays[index]);
      osc.stop(now + noteDelays[index] + 0.4);
    });
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  const push = useCallback(
    (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      dispatch({
        type: "PUSH",
        notification: {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          read: false,
        },
      });
      playNotificationSound();
    },
    []
  );

  const markRead = useCallback((id: string) => {
    dispatch({ type: "MARK_READ", id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications: state.notifications, unreadCount, push, markRead, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside <NotificationsProvider>");
  }
  return ctx;
}
