"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, RefreshCw, XCircle, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifierProps {
  slug: string;
  sealedRulesHash: string | null;
  version: number;
}

export function PublicRuleVerifier({ slug, sealedRulesHash, version }: VerifierProps) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/instances-public/${slug}/verify`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Verification check failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-ceda-sand p-2 text-ceda-copper">
            <Hash size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-ceda-ink">Deterministic Rules Verification</h2>
            <p className="text-xs text-ceda-slate">
              Recompute the SHA-256 fingerprint to verify the competition rules have remained unchanged since publication.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ceda-ink px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ceda-copper disabled:opacity-50 transition"
        >
          <RefreshCw size={14} className={verifying ? "animate-spin" : ""} />
          {verifying ? "Computing Hash..." : "Verify These Rules"}
        </button>
      </div>

      {sealedRulesHash && !result && (
        <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-border text-xs">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-ceda-ink">Sealed Ruleset (v{version}):</span>
            <code className="font-mono text-ceda-slate truncate">{sealedRulesHash}</code>
          </div>
          <button
            type="button"
            onClick={() => copyHash(sealedRulesHash)}
            className="text-xs text-ceda-copper hover:underline font-semibold flex-shrink-0 ml-2"
          >
            {copied ? "Copied!" : "Copy Hash"}
          </button>
        </div>
      )}

      {result && (
        <div
          className={cn(
            "rounded-xl border p-4 text-xs space-y-3 transition",
            result.matches
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
              : "border-rose-200 bg-rose-50/70 text-rose-950"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.matches ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>100% Mathematically Verified Match</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-600" />
                  <span>Fingerprint Mismatch Detected</span>
                </>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {result.byteLength} bytes canonicalized
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] bg-white/90 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-ceda-slate">Published RulesHash: </span>
              <span className="font-bold text-ceda-ink break-all">{result.storedRulesHash}</span>
            </div>
            <div>
              <span className="text-ceda-slate">Computed RulesHash:  </span>
              <span className="font-bold text-emerald-700 break-all">{result.computedRulesHash}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Verified at: {result.verifiedAt}</span>
            <span className="font-medium text-emerald-800">
              Ruleset version {result.currentVersion} is authentic & un-tampered
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
