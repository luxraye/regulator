"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, MessageSquare, Send } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface Msg {
  id: string;
  body: string;
  internal: boolean;
  createdAt: string;
  mine: boolean;
  author: string;
  fromCeda: boolean;
}

/** Clarification thread between CEDA and the innovator. Staff may also leave internal notes. */
export function MessageThread({ instanceId, staff = false, title = "Messages" }: { instanceId: string; staff?: boolean; title?: string }) {
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/instances/${instanceId}/messages`, { cache: "no-store" });
    if (res.ok) setMessages(await res.json());
  }, [instanceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    setError(null);
    setSending(true);
    const res = await fetch(`/api/instances/${instanceId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, internal }),
    });
    setSending(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not send");
      return;
    }
    setBody("");
    load();
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-ceda-navy">
        <MessageSquare size={16} /> {title}
      </h3>
      {messages === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {staff ? "No messages yet. Ask the innovator a question, or leave an internal note." : "No messages yet. Ask CEDA a question about your application here."}
        </p>
      ) : (
        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <li key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.internal ? "border border-dashed border-amber-300 bg-amber-50" : m.mine ? "bg-ceda-blue text-white" : "bg-ceda-light"
                )}
              >
                <p className={cn("mb-0.5 text-[11px]", m.mine && !m.internal ? "text-white/70" : "text-muted-foreground")}>
                  {m.internal && <Lock size={10} className="mr-1 inline" />}
                  {m.author} · {timeAgo(m.createdAt)}
                  {m.internal && " · internal"}
                </p>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={staff ? (internal ? "Internal note (the innovator won't see this)" : "Message the innovator") : "Write to the CEDA team"}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue"
          aria-label="Message"
        />
        <div className="flex items-center justify-between gap-2">
          {staff ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note
            </label>
          ) : (
            <span />
          )}
          <button
            onClick={send}
            disabled={sending || body.trim().length < 2}
            className="flex items-center gap-1.5 rounded-lg bg-ceda-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-ceda-navy/90 disabled:opacity-40"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </section>
  );
}
