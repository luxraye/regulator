"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, CheckCircle2, AlertTriangle, Trash2, Loader2, X, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string; email: string };
}

export default function PartnerKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (e) {
      console.error("Error loading keys:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.apiKey);
        setKeyName("");
        await fetchKeys();
      }
    } catch (err) {
      console.error("Failed to generate key:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using this key will immediately be rejected.")) {
      return;
    }
    setRevokingId(id);
    try {
      const res = await fetch(`/api/partner/keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchKeys();
      }
    } catch (err) {
      console.error("Failed to revoke key:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <span>Partner Workspace</span>
            <span>•</span>
            <span className="font-semibold text-ceda-copper">Integration</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            API Keys & Programmatic Access
          </h1>
          <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
            Manage your partner organization&apos;s high-entropy API keys for calling the CEDA Partner API v1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/api/v1/docs"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
          >
            <span>API v1 Docs</span>
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={() => {
              setNewlyCreatedKey(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-ceda-ink px-4 py-2 text-xs font-bold text-white shadow hover:bg-black transition"
          >
            <Plus size={16} />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* Newly Created Key Alert Modal */}
      {newlyCreatedKey && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 space-y-3 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>API Key Generated Successfully</span>
            </div>
            <button onClick={() => setNewlyCreatedKey(null)} className="text-emerald-800 hover:text-black">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-emerald-900">
            Please copy this API key immediately. For security, we never store the plaintext key and it cannot be recovered after this session.
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-emerald-300">
            <code className="flex-1 font-mono text-xs font-bold text-emerald-950 break-all select-all">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-ceda-copper transition shrink-0"
            >
              {copiedKey ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-ceda-orange" size={24} />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Key size={32} className="mx-auto text-ceda-slate mb-3" />
          <h3 className="font-bold text-ceda-ink">No API keys created yet</h3>
          <p className="text-xs text-ceda-slate mt-1 max-w-md mx-auto">
            Generate an API key to integrate external application intake systems, HR portals, or automated judging pipelines.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-ceda-slate border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Key Identifier & Prefix</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Last Used</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-ceda-ink text-sm">{k.name}</div>
                      <div className="font-mono text-ceda-slate text-xs mt-0.5">
                        {k.keyPrefix}••••••••••••••••
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {k.revokedAt ? (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ceda-slate">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never used"}
                    </td>
                    <td className="px-5 py-3.5 text-ceda-slate">
                      <div>{formatDate(k.createdAt)}</div>
                      {k.createdBy && <div className="text-[11px] text-muted-foreground">{k.createdBy.name}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!k.revokedAt && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          disabled={revokingId === k.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          {revokingId === k.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Generation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-ceda-ink text-base">Generate Partner API Key</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-ceda-slate hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Key Description / Purpose</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Webhook Intake Service"
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                  required
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-ceda-slate border border-border space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-ceda-ink">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Scoped Access</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Keys generated here are bound exclusively to your partner organization and can only query and mutate your partner&apos;s instances and submissions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-ceda-slate hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-ink px-4 py-2 font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Generate Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
