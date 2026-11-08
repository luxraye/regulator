"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      /* offline: keep what we have */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  async function markRead(body: { ids?: string[]; all?: boolean }) {
    setItems((prev) => prev.map((n) => (body.all || body.ids?.includes(n.id) ? { ...n, read: true } : n)));
    setUnread((u) => (body.all ? 0 : Math.max(0, u - (body.ids?.length ?? 0))));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ceda-navy hover:bg-ceda-light transition-colors"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ceda-orange px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ceda-navy">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => markRead({ all: true })}
                className="flex items-center gap-1 text-xs font-medium text-ceda-blue hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 divide-y divide-border overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => {
                const content = (
                  <div className={cn("px-4 py-3 text-left", !n.read && "bg-ceda-blue/5")}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ceda-blue" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ceda-navy">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
                const onClick = () => {
                  if (!n.read) markRead({ ids: [n.id] });
                  setOpen(false);
                };
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={onClick} className="block hover:bg-ceda-light">
                    {content}
                  </Link>
                ) : (
                  <button key={n.id} onClick={onClick} className="block w-full hover:bg-ceda-light">
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
