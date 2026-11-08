"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Phone, Search, ShieldQuestion, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { COMPLAINT_STATUSES, complaintStatusMeta } from "@/lib/labels";
import { cn, formatDate, timeAgo } from "@/lib/utils";

interface Complaint {
  id: string;
  trackingCode: string;
  isAnonymous: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  provider: string;
  category: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ComplaintsDesk() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("ACTIVE");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL" && status !== "ACTIVE") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/complaints?${params}`, { cache: "no-store" });
    const data: Complaint[] = res.ok ? await res.json() : [];
    setComplaints(status === "ACTIVE" ? data.filter((c) => c.status === "OPEN" || c.status === "UNDER_REVIEW") : data);
    setLoading(false);
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    const open = new URLSearchParams(window.location.search).get("open");
    if (open) {
      setSelectedId(open);
      setStatus("ALL");
    }
  }, []);

  const selected = complaints.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap gap-2">
          {["ACTIVE", ...COMPLAINT_STATUSES, "ALL"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === s ? "border-bocra-navy bg-bocra-navy text-white" : "border-border bg-white hover:bg-bocra-light"
              )}
            >
              {s === "ACTIVE" ? "Needs action" : s === "ALL" ? "All" : complaintStatusMeta[s].label}
            </button>
          ))}
        </div>
        <label className="relative mb-3 block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code, provider or text"
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
          />
        </label>
        <div className="max-h-[70vh] divide-y divide-border overflow-y-auto rounded-xl border border-border bg-white">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </p>
          ) : complaints.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No complaints match.</p>
          ) : (
            complaints.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn("block w-full px-4 py-3 text-left transition-colors hover:bg-bocra-light/60", selectedId === c.id && "bg-bocra-light")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{c.trackingCode}</span>
                  <StatusBadge kind="complaint" status={c.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-bocra-navy">{c.category}</p>
                <p className="text-xs text-muted-foreground">
                  {c.provider} · {timeAgo(c.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <ComplaintDetail
            key={selected.id}
            complaint={selected}
            onSaved={(updated) => setComplaints((list) => list.map((c) => (c.id === updated.id ? updated : c)))}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center text-sm text-muted-foreground">
            Pick a complaint to read it and respond.
          </div>
        )}
      </div>
    </div>
  );
}

function ComplaintDetail({ complaint, onSaved }: { complaint: Complaint; onSaved: (c: Complaint) => void }) {
  const [status, setStatus] = useState(complaint.status);
  const [notes, setNotes] = useState(complaint.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = status !== complaint.status || notes !== (complaint.adminNotes ?? "");

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage({ ok: false, text: data.error || "Could not save" });
      return;
    }
    onSaved(data);
    setMessage({
      ok: true,
      text: complaint.isAnonymous || !complaint.email ? "Saved. Visible on the public tracking page." : "Saved. The complainant has been notified.",
    });
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{complaint.trackingCode}</p>
          <h2 className="text-lg font-semibold text-bocra-navy">{complaint.category}</h2>
          <p className="text-sm text-muted-foreground">
            Against <span className="font-medium text-bocra-navy">{complaint.provider}</span> · filed {formatDate(complaint.createdAt, true)}
          </p>
        </div>
        <StatusBadge kind="complaint" status={complaint.status} />
      </div>

      <div className="mt-4 rounded-lg bg-bocra-light p-4 text-sm leading-relaxed whitespace-pre-line">{complaint.description}</div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {complaint.isAnonymous ? (
          <span className="flex items-center gap-1.5">
            <ShieldQuestion size={15} /> Filed anonymously — reply through the tracking page only
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><User size={15} /> {complaint.name ?? "No name given"}</span>
            {complaint.email && (
              <a href={`mailto:${complaint.email}?subject=${encodeURIComponent(`Your BOCRA complaint ${complaint.trackingCode}`)}`} className="flex items-center gap-1.5 text-bocra-blue hover:underline">
                <Mail size={15} /> {complaint.email}
              </a>
            )}
            {complaint.phone && (
              <a href={`tel:${complaint.phone}`} className="flex items-center gap-1.5 text-bocra-blue hover:underline">
                <Phone size={15} /> {complaint.phone}
              </a>
            )}
          </>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COMPLAINT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                status === s ? "border-bocra-blue bg-bocra-blue/10 text-bocra-blue" : "border-border hover:bg-bocra-light"
              )}
            >
              {complaintStatusMeta[s].label}
            </button>
          ))}
        </div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">
          Response to complainant
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="What BOCRA has done or will do next. This is public on the tracking page."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={save}
            disabled={!changed || saving}
            className="flex items-center gap-2 rounded-lg bg-bocra-navy px-4 py-2 text-sm font-medium text-white hover:bg-bocra-navy/90 disabled:opacity-40"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Save update
          </button>
          {message && <p className={cn("text-sm", message.ok ? "text-green-700" : "text-red-600")}>{message.text}</p>}
        </div>
      </div>
    </div>
  );
}
