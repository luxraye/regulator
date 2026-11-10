"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Lock, ScrollText, RefreshCw, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { actionLabel } from "@/lib/labels";

interface AuditLogRecord {
  id: string;
  action: string;
  createdAt: string;
  hash?: string | null;
  prevHash?: string | null;
  actor: { id: string; name: string; email: string; role: string };
  instance?: { id: string; name: string; slug: string } | null;
  entry?: { id: string; title: string; referenceCode: string } | null;
  metadata?: any;
}

interface ChainStatus {
  valid: boolean;
  totalEvents: number;
  genesisHash: string;
  tipHash: string | null;
  details: string;
}

export default function PartnerAuditPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setChainStatus(data.chainStatus || null);
      }
    } catch (e) {
      console.error("Error loading partner audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <span>Partner Workspace</span>
            <span>•</span>
            <span className="font-semibold text-ceda-copper">Integrity</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            Tamper-Evident Audit Trail
          </h1>
          <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
            Append-only, SHA-256 hash-chained immutable event trail for your partner organization. {total} total events.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-ceda-orange" : "text-ceda-slate"} />
          <span>Verify & Refresh</span>
        </button>
      </div>

      {/* Cryptographic Chain Integrity Banner */}
      {chainStatus && (
        <div
          className={`rounded-2xl border p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm ${
            chainStatus.valid
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {chainStatus.valid ? (
              <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert size={22} className="text-rose-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {chainStatus.valid ? "Cryptographic Hash Chain Verified" : "Integrity Breach Detected!"}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">{chainStatus.details}</p>
            </div>
          </div>

          {chainStatus.tipHash && (
            <div className="flex items-center gap-2 rounded-lg bg-white/80 border border-current/20 px-3 py-1 font-mono text-[11px]">
              <Lock size={12} className="shrink-0 text-ceda-orange" />
              <span>Chain Tip: {chainStatus.tipHash.slice(0, 16)}...</span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-ceda-orange" size={24} />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <ScrollText size={32} className="mx-auto text-ceda-slate mb-3" />
          <h3 className="font-bold text-ceda-ink">No audit logs recorded yet</h3>
          <p className="text-xs text-ceda-slate mt-1 max-w-md mx-auto">
            Audit logs will automatically appear when actions, instance edits, or decisions are made within your partner space.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-ceda-slate border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Actor</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Hash Fingerprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3 whitespace-nowrap text-ceda-slate">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ceda-ink">{e.actor.name}</p>
                      <p className="text-[11px] text-muted-foreground">{e.actor.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-ceda-ink">{actionLabel(e.action)}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground">{e.action}</span>
                    </td>
                    <td className="px-5 py-3">
                      {e.instance && (
                        <span className="block font-semibold text-ceda-ink">{e.instance.name}</span>
                      )}
                      {e.entry && (
                        <span className="block font-mono text-ceda-copper">{e.entry.referenceCode}</span>
                      )}
                      {!e.instance && !e.entry && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {e.hash ? (
                        <div className="space-y-0.5">
                          <code className="block font-mono text-[11px] text-ceda-ink">{e.hash.slice(0, 16)}...</code>
                          <span className="block font-mono text-[10px] text-muted-foreground">
                            prev: {e.prevHash ? e.prevHash.slice(0, 8) + "..." : "genesis"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Legacy record</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
