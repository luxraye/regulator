"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaithfulnessReport, GuardCheckOutcome } from "@/lib/guards/types";

interface PreflightChecklistProps {
  entryId: string;
  onPreflightComplete?: (report: FaithfulnessReport) => void;
  readOnly?: boolean;
}

export function PreflightChecklist({
  entryId,
  onPreflightComplete,
  readOnly = false,
}: PreflightChecklistProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FaithfulnessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPreflight() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/instances/${entryId}/preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Preflight checks failed to run.");
      }
      setReport(data.report);
      if (onPreflightComplete) {
        onPreflightComplete(data.report);
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute pre-flight guard checks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runPreflight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-ceda-orange" />
            <h3 className="font-bold text-base text-ceda-ink">
              Participant Pre-Flight & Compliance Checklist
            </h3>
          </div>
          <p className="text-xs text-ceda-slate mt-0.5">
            Automated verification of binary magic bytes, archive safety, secrets, reachability, and DPA compliance.
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={runPreflight}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ceda-ink hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
            {loading ? "Verifying..." : "Re-run Checks"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <XCircle size={15} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div
            className={cn(
              "rounded-xl p-3.5 flex items-start gap-3 border text-xs",
              report.hardFailBlocked
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : report.warnCount > 0
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            )}
          >
            {report.hardFailBlocked ? (
              <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
            ) : report.warnCount > 0 ? (
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {report.hardFailBlocked
                  ? `Submission Blocked: ${report.failCount} Critical Guard Failure(s)`
                  : report.warnCount > 0
                  ? `Pre-flight Ready with ${report.warnCount} Advisory Warning(s)`
                  : "All Pre-Flight Security & Faithfulness Checks Passed"}
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {report.hardFailBlocked
                  ? "Resolve all red failure items below to unlock the final submission and cryptographic receipt signing."
                  : report.warnCount > 0
                  ? "You may submit your idea. Warnings will be automatically routed to evaluation screeners."
                  : "Your submission satisfies all cryptographic integrity, statutory eligibility, and pre-flight safety policies."}
              </p>
            </div>
          </div>

          {/* Checks Breakdown */}
          <div className="space-y-2">
            {report.checks.map((check: GuardCheckOutcome) => (
              <div
                key={check.checkKey}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3 text-xs transition",
                  check.status === "PASS"
                    ? "border-slate-100 bg-slate-50/60"
                    : check.status === "WARN"
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-rose-200 bg-rose-50/60"
                )}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ceda-ink">{check.name}</span>
                    <span className="rounded bg-white border border-border px-1.5 py-0.2 text-[10px] uppercase font-mono text-ceda-slate">
                      {check.category}
                    </span>
                  </div>
                  <p className="text-ceda-slate leading-relaxed text-[11px]">{check.detail}</p>
                </div>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shrink-0",
                    check.status === "PASS"
                      ? "bg-emerald-100 text-emerald-800"
                      : check.status === "WARN"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  {check.status}
                </span>
              </div>
            ))}
          </div>

          {/* Cryptographic Faithfulness Fingerprint */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-border p-2.5 text-xs text-ceda-slate">
            <div className="flex items-center gap-2">
              <Lock size={13} className="text-ceda-orange" />
              <span>Faithfulness Report Hash:</span>
              <span className="font-mono text-ceda-ink font-bold">
                {report.faithfulnessHash.slice(0, 16)}...{report.faithfulnessHash.slice(-8)}
              </span>
            </div>
            <span className="text-[11px]">SHA-256</span>
          </div>
        </div>
      )}
    </div>
  );
}
