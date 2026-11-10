"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, RefreshCw, Trash2, Search, ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DemoMessage {
  id: string;
  to: string;
  type: "EMAIL" | "SMS";
  subject?: string | null;
  body: string;
  metadata?: any;
  createdAt: string;
}

export default function DemoInboxPage() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "EMAIL" | "SMS">("ALL");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<DemoMessage | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/demo-inbox");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load demo inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    if (!confirm("Clear all messages in demo inbox?")) return;
    try {
      await fetch("/api/demo-inbox", { method: "DELETE" });
      setMessages([]);
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to clear inbox:", err);
    }
  };

  const filtered = messages.filter((m) => {
    if (activeTab !== "ALL" && m.type !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.to.toLowerCase().includes(q) ||
        (m.subject && m.subject.toLowerCase().includes(q)) ||
        m.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <span>Evaluation & Verification</span>
            <span>•</span>
            <span className="font-semibold text-ceda-copper">Judge Sandbox</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            Live Demo Inbox
          </h1>
          <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
            Outgoing email verification links, SMS OTP codes, and password reset dispatches are captured here in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMessages}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-ceda-orange" : "text-ceda-slate"} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <Trash2 size={14} />
            <span>Clear Inbox</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded-lg px-3 py-1.5 font-bold transition ${activeTab === "ALL" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"}`}
          >
            All Dispatches ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("EMAIL")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold transition ${activeTab === "EMAIL" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"}`}
          >
            <Mail size={13} />
            Email ({messages.filter((m) => m.type === "EMAIL").length})
          </button>
          <button
            onClick={() => setActiveTab("SMS")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold transition ${activeTab === "SMS" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"}`}
          >
            <MessageSquare size={13} />
            SMS ({messages.filter((m) => m.type === "SMS").length})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-ceda-slate" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient or content..."
            className="w-full rounded-xl border border-border bg-white pl-9 pr-3 py-1.5 text-xs text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
          />
        </div>
      </div>

      {/* Main List and Preview Split View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Message List */}
        <div className="lg:col-span-6 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-xs text-ceda-slate">
              No communication items found. Trigger an account registration, OTP sign-in, or password reset to see it arrive here.
            </div>
          ) : (
            filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`cursor-pointer rounded-xl border p-4 text-xs transition shadow-sm ${
                  selectedMessage?.id === msg.id
                    ? "border-ceda-orange bg-orange-50/50"
                    : "border-border bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider ${
                    msg.type === "EMAIL" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {msg.type === "EMAIL" ? <Mail size={10} /> : <MessageSquare size={10} />}
                    {msg.type}
                  </span>
                  <span className="text-[11px] text-ceda-slate flex items-center gap-1">
                    <Clock size={11} /> {formatDate(msg.createdAt)}
                  </span>
                </div>

                <div className="font-bold text-sm text-ceda-ink truncate">
                  {msg.subject || (msg.type === "SMS" ? "SMS Alert" : "No Subject")}
                </div>

                <div className="text-ceda-slate font-mono text-[11px] mt-0.5">
                  To: <span className="font-semibold text-ceda-ink">{msg.to}</span>
                </div>

                <p className="mt-2 text-ceda-slate line-clamp-2 leading-relaxed">
                  {msg.body}
                </p>

                {msg.metadata?.code && (
                  <div className="mt-2.5 inline-block rounded-lg bg-ceda-sand px-2 py-1 font-mono font-bold text-ceda-copper text-xs">
                    OTP: {msg.metadata.code}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Viewer Pane */}
        <div className="lg:col-span-6">
          {selectedMessage ? (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5 sticky top-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    selectedMessage.type === "EMAIL" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {selectedMessage.type}
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-ceda-ink">
                    {selectedMessage.subject || "SMS Message"}
                  </h2>
                </div>
                <span className="text-xs text-ceda-slate">{formatDate(selectedMessage.createdAt)}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-ceda-slate">
                  Recipient: <code className="font-mono font-bold text-ceda-ink">{selectedMessage.to}</code>
                </div>
                {selectedMessage.metadata?.purpose && (
                  <div className="text-ceda-slate">
                    Event Type: <span className="font-medium text-ceda-copper">{selectedMessage.metadata.purpose}</span>
                  </div>
                )}
              </div>

              {selectedMessage.metadata?.code && (
                <div className="rounded-xl border border-ceda-copper/20 bg-gradient-to-r from-ceda-sand via-orange-50 to-ceda-sand p-4 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-ceda-copper">
                    Verification Code
                  </span>
                  <div className="text-3xl font-extrabold tracking-widest font-mono text-ceda-ink">
                    {selectedMessage.metadata.code}
                  </div>
                  <p className="text-[11px] text-ceda-slate">Valid for 10 minutes from dispatch</p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-slate-50 p-4 text-xs font-sans whitespace-pre-wrap leading-relaxed text-ceda-ink">
                {selectedMessage.body}
              </div>

              {selectedMessage.metadata?.actionUrl && (
                <div className="pt-2">
                  <Link
                    href={selectedMessage.metadata.actionUrl}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ceda-orange py-2.5 text-xs font-bold text-white hover:bg-ceda-copper transition"
                  >
                    <span>Complete Verification Flow</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50/50 p-12 text-center text-xs text-ceda-slate h-64 flex flex-col items-center justify-center">
              <Mail size={32} className="text-ceda-slate/60 mb-2" />
              <span>Select any dispatch from the left panel to inspect message body and one-time verification tokens.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
