"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send, Clock, ShieldCheck, Loader2, Sparkles } from "lucide-react";

interface StatusResponse {
  open: boolean;
  currentCatTime: string;
  reason?: string;
  nextOpening?: string;
  isHoliday?: boolean;
  holidayName?: string;
  waitingQueueCount?: number;
}

interface MessageItem {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
}

export function ConsultantChatWidget({ instanceId }: { instanceId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [offlineSubject, setOfflineSubject] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");
  const [offlineSubmitted, setOfflineSubmitted] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/chat/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error("Failed to load chat status:", e);
    }
  };

  const fetchMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load chat messages:", e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [isOpen]);

  useEffect(() => {
    if (!sessionId) return;
    fetchMessages(sessionId);
    const interval = setInterval(() => fetchMessages(sessionId), 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleStartSession = async (initialText: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceId: instanceId || null,
          subject: "Applicant Inquiry",
          initialMessage: initialText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setInputText("");
        await fetchMessages(data.session.id);
      }
    } catch (e) {
      console.error("Failed to start chat session:", e);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!sessionId) {
      await handleStartSession(inputText);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: inputText,
        }),
      });

      if (res.ok) {
        setInputText("");
        await fetchMessages(sessionId);
      }
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setSending(false);
    }
  };

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceId: instanceId || null,
          subject: offlineSubject || "Offline Inquiry",
          initialMessage: offlineMessage,
        }),
      });
      setOfflineSubmitted(true);
    } catch (e) {
      console.error("Failed to submit offline message:", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-ceda-orange px-4 py-3 font-bold text-white shadow-lg hover:bg-ceda-copper transition-all transform hover:scale-105"
          aria-label="Open CEDA Consultant Chat"
        >
          <MessageSquare size={18} />
          <span className="text-xs">Consultant Chat</span>
          {status?.open && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] rounded-2xl border border-border bg-white shadow-2xl overflow-hidden flex flex-col h-[520px] animate-fadeIn">
          {/* Header */}
          <div className="bg-ceda-ink p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-ceda-orange p-1.5 text-white">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">CEDA Consultant Live Advisory</h3>
                <span className="text-[11px] text-white/70 block">
                  {status?.open ? "09:00 - 16:00 CAT • Live Now" : "Currently Offline (09:00 - 16:00 CAT)"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {!status?.open ? (
              // Offline Message View
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-1.5 text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Clock size={14} className="text-amber-700" />
                    <span>Advisory Service Offline</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    {status?.reason || "Consultants are available Monday to Friday from 09:00 to 16:00 CAT."}
                  </p>
                  {status?.nextOpening && (
                    <div className="text-[10px] font-semibold text-amber-800">
                      Next Opening: {status.nextOpening}
                    </div>
                  )}
                </div>

                {offlineSubmitted ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
                    <ShieldCheck size={28} className="mx-auto text-emerald-600" />
                    <h4 className="font-bold text-sm text-emerald-950">Inquiry Logged</h4>
                    <p className="text-xs text-emerald-800">
                      Your message has been assigned to the consultant queue. Our officers will respond as soon as the service opens at 09:00 CAT.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleOfflineSubmit} className="space-y-3 pt-1">
                    <p className="text-ceda-slate leading-relaxed">
                      Leave an inquiry or clarification below and a CEDA consultant will review it:
                    </p>
                    <div>
                      <input
                        type="text"
                        value={offlineSubject}
                        onChange={(e) => setOfflineSubject(e.target.value)}
                        placeholder="Subject (e.g. Omang verification question)"
                        className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        value={offlineMessage}
                        onChange={(e) => setOfflineMessage(e.target.value)}
                        rows={3}
                        placeholder="Describe your inquiry or question..."
                        className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full rounded-xl bg-ceda-ink py-2.5 font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Submit Inquiry"}
                    </button>
                  </form>
                )}
              </div>
            ) : sessionId ? (
              // Live Ongoing Conversation
              <div className="space-y-3">
                <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-center text-ceda-slate border border-border">
                  Connected to CEDA Advisory Desk. A consultant is reviewing your dossier.
                </div>

                {messages.map((m) => {
                  const isAgent = m.senderRole === "CONSULTANT" || m.senderRole === "ADMIN";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
                    >
                      <span className="text-[10px] text-ceda-slate mb-0.5">
                        {isAgent ? "CEDA Consultant" : "You"}
                      </span>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs max-w-[85%] leading-relaxed ${
                          isAgent
                            ? "bg-slate-100 text-ceda-ink rounded-tl-none border border-border"
                            : "bg-ceda-orange text-white rounded-tr-none shadow-sm"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Initial Prompt
              <div className="space-y-4 py-4 text-center">
                <div className="rounded-full bg-ceda-sand p-3 w-12 h-12 mx-auto flex items-center justify-center text-ceda-copper">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ceda-ink">Connect with a CEDA Consultant</h4>
                  <p className="text-xs text-ceda-slate mt-1 max-w-xs mx-auto">
                    Ask questions regarding proposal requirements, financial models, team eligibility, or rubric scoring criteria.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-[11px] text-ceda-slate border border-border">
                  Operating 09:00 - 16:00 CAT (Mon - Fri)
                </div>
              </div>
            )}
          </div>

          {/* Message Input (when open) */}
          {status?.open && (
            <form onSubmit={handleSendMessage} className="border-t border-border p-3 flex items-center gap-2 bg-slate-50">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2 text-xs text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-ceda-orange px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-ceda-copper transition disabled:opacity-50"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
