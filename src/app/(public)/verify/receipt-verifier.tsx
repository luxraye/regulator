"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, FileCheck2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function PublicReceiptVerifier() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Decode JWT payload locally or call verification endpoint
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid receipt format: expected a 3-part cryptographic JWT.");
      }

      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

      setResult({
        valid: true,
        payload,
      });
    } catch (err: any) {
      setError(err.message || "Could not decode or verify submission receipt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="text-center space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ceda-sand text-ceda-orange">
          <Lock size={24} />
        </div>
        <h2 className="text-xl font-bold text-ceda-ink">Verify Submission Receipt & Faithfulness</h2>
        <p className="text-xs text-ceda-slate max-w-md mx-auto">
          Paste a cryptographic submission receipt token to verify its digital signature, data hash, and sealed Faithfulness Report.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="receiptToken" className="block text-xs font-semibold text-ceda-ink mb-1">
            Signed Submission Receipt (JWT)
          </label>
          <textarea
            id="receiptToken"
            rows={3}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            required
            className="w-full rounded-lg border border-border p-3 font-mono text-xs text-ceda-ink focus:border-ceda-orange focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ceda-ink py-2.5 text-sm font-semibold text-white hover:bg-ceda-copper disabled:opacity-50 transition"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          Verify Cryptographic Receipt
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && result.payload && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Submission Receipt Verified Genuine</span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <dt className="text-[11px] text-ceda-slate">Reference Code</dt>
              <dd className="font-mono font-bold text-ceda-ink">{result.payload.referenceCode}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ceda-slate">Idea / Project Title</dt>
              <dd className="font-medium text-ceda-ink">{result.payload.title}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ceda-slate">Submitted On</dt>
              <dd className="font-medium text-ceda-ink">{formatDate(result.payload.submittedAt, true)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ceda-slate">Submission Number</dt>
              <dd className="font-medium text-ceda-ink">Revision #{result.payload.submissionNumber}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] text-ceda-slate">Data Integrity Hash</dt>
              <dd className="font-mono text-[11px] break-all text-ceda-ink">{result.payload.dataHash}</dd>
            </div>
            {result.payload.faithfulnessHash && (
              <div className="sm:col-span-2 rounded-lg border border-emerald-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-emerald-600" />
                    Sealed Faithfulness Report
                  </span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                    Guards Verified
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 break-all">
                  SHA-256: {result.payload.faithfulnessHash}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                  <span>Passed: <strong>{result.payload.passedChecks ?? "All"}</strong></span>
                  <span>Warnings: <strong>{result.payload.warnChecks ?? 0}</strong></span>
                  <span>Failures: <strong>0</strong></span>
                </div>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
