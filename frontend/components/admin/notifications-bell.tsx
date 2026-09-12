"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export function NotificationsBell({
  notifications,
  unreadCount,
  markAllRead,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full border border-white/20 p-2 text-white hover:border-white/50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-bold text-neutral-950">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <form action={markAllRead}>
                <button type="submit" className="text-xs text-lime-400 hover:underline">
                  Mark all read
                </button>
              </form>
            )}
          </div>
          <ul className="mt-3 max-h-72 space-y-3 overflow-y-auto text-sm">
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-white/10 pb-2 last:border-0">
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-xs text-neutral-400">{n.body}</p>
                <p className="mt-1 text-[10px] text-neutral-600">{n.createdAt}</p>
              </li>
            ))}
            {notifications.length === 0 && <p className="text-sm text-neutral-400">No notifications.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}
