"use client";

import { useEffect, useState } from "react";
import { Headset, CheckCircle2, Send, Loader2, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ChatSessionItem {
  id: string;
  status: "WAITING" | "ACTIVE" | "RESOLVED";
  subject?: string | null;
  startedAt: string;
  user: { id: string; name: string; email: string; organizationName?: string | null };
  consultant?: { id: string; name: string; email: string } | null;
  instance?: { id: string; name: string; slug: string } | null;
  messages: { body: string; createdAt: string }[];
}

interface MessageItem {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export default function ConsultantConsolePage() {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"queue" | "my">("queue");

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/chat/sessions?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!selectedSessionId) return;
    fetchMessages(selectedSessionId);
    const interval = setInterval(() => fetchMessages(selectedSessionId), 3000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  const handleClaim = async (sessionId: string) => {
    try {
      const res = await fetch("/api/chat/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setSelectedSessionId(sessionId);
        setActiveTab("my");
        await fetchSessions();
      }
    } catch (err) {
      console.error("Failed to claim session:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSessionId, message: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        await fetchMessages(selectedSessionId);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (sessionId: string) => {
    if (!confirm("Mark this advisory consultation as resolved?")) return;
    try {
      const res = await fetch("/api/chat/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setSelectedSessionId(null);
        await fetchSessions();
      }
    } catch (err) {
      console.error("Failed to resolve session:", err);
    }
  };

  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-xs text-ceda-slate">
          <span>Advisory Services</span>
          <span>•</span>
          <span className="font-semibold text-ceda-copper">09:00 - 16:00 CAT</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
          Consultant Queue & Live Chat Console
        </h1>
        <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
          Assist innovators with technical clarification, statutory eligibility questions, and rubric alignment in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Queue / Session Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("queue"); setSelectedSessionId(null); }}
              className={`flex-1 rounded-lg py-2 transition text-center ${
                activeTab === "queue" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"
              }`}
            >
              Waiting Queue
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 rounded-lg py-2 transition text-center ${
                activeTab === "my" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"
              }`}
            >
              My Active Chats
            </button>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 size={20} className="animate-spin text-ceda-orange" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-xs text-ceda-slate">
                No sessions in {activeTab === "queue" ? "waiting queue" : "active chats"}.
              </div>
            ) : (
              sessions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSessionId(item.id)}
                  className={`cursor-pointer rounded-xl border p-4 text-xs transition shadow-sm space-y-2 ${
                    selectedSessionId === item.id
                      ? "border-ceda-orange bg-orange-50/50"
                      : "border-border bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ceda-ink text-sm">{item.user.name}</span>
                    <span className="text-[11px] text-ceda-slate">{formatDate(item.startedAt)}</span>
                  </div>

                  <div className="text-ceda-slate">
                    {item.user.organizationName || item.user.email}
                  </div>

                  {item.instance && (
                    <div className="inline-block rounded bg-ceda-sand px-2 py-0.5 text-[11px] font-semibold text-ceda-copper">
                      {item.instance.name}
                    </div>
                  )}

                  {item.status === "WAITING" && activeTab === "queue" && (
                    <div className="pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClaim(item.id); }}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-ceda-orange py-1.5 font-bold text-white shadow hover:bg-ceda-copper transition"
                      >
                        <Sparkles size={13} />
                        <span>Claim & Respond</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="lg:col-span-7">
          {selectedSessionId && currentSession ? (
            <div className="rounded-2xl border border-border bg-white shadow-sm flex flex-col h-[580px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-bold text-ceda-ink text-sm">{currentSession.user.name}</h3>
                  <p className="text-xs text-ceda-slate">
                    {currentSession.subject || "Advisory Session"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolve(selectedSessionId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <CheckCircle2 size={13} />
                    <span>Resolve Session</span>
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-ceda-slate py-12">
                    Session started. Send your initial advisory response below.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isConsultant = msg.senderRole === "CONSULTANT" || msg.senderRole === "ADMIN";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isConsultant ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-ceda-slate mb-0.5">
                          {isConsultant ? "CEDA Consultant" : msg.sender.name} • {formatDate(msg.createdAt)}
                        </span>
                        <div
                          className={`rounded-2xl px-4 py-2 text-xs max-w-md leading-relaxed ${
                            isConsultant
                              ? "bg-ceda-ink text-white rounded-tr-none"
                              : "bg-slate-100 text-ceda-ink rounded-tl-none border border-border"
                          }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="border-t border-border p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type advice or guidance to applicant..."
                  className="flex-1 rounded-xl border border-border px-3.5 py-2 text-xs text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-ceda-copper transition disabled:opacity-50"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50/50 p-12 text-center text-xs text-ceda-slate h-[580px] flex flex-col items-center justify-center">
              <Headset size={36} className="text-ceda-slate/60 mb-2" />
              <span>Select an inquiry from the queue or active list to begin advisory response.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
