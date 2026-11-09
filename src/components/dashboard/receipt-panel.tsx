"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

interface IntegrityReport {
  receiptValid: boolean;
  receiptReason: string | null;
  dataMatches: boolean;
  files: { fileKey: string; fileName: string; storedHashMatches: boolean; inReceipt: boolean }[];
  faithfulnessHash?: string | null;
  faithfulnessVerified?: boolean;
  ok: boolean;
}

/** Shows a submission receipt and lets the viewer re-verify it against stored data. */
export function ReceiptPanel({
  instanceId,
  submissionJwt,
  dataHash,
}: {
  instanceId: string;
  submissionJwt: string;
  dataHash: string | null;
}) {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`/api/instances/${instanceId}/integrity`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data);
    } catch (e) {
      setError((e as Error).message || "Could not verify right now");
    }
    setChecking(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(submissionJwt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ceda-ink">Signed submission receipt</h3>
          <p className="text-xs text-muted-foreground">
            Binds the submitted data and every file hash to this submission. Any later change breaks it.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-ceda-sand"
          >
            {copied ? <CheckCircle2 size={14} className="text-ceda-green" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy receipt"}
          </button>
          <button
            onClick={verify}
            disabled={checking}
            className="flex items-center gap-1.5 rounded-lg bg-ceda-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ceda-ink/90 disabled:opacity-60"
          >
            {checking ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Verify integrity
          </button>
        </div>
      </div>

      {dataHash && (
        <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
          Data hash: <span className="text-ceda-ink">{dataHash}</span>
        </p>
      )}
      <p className="mt-1 break-all rounded-lg bg-ceda-sand p-2 font-mono text-[11px] leading-relaxed text-muted-foreground max-h-[3.6rem] overflow-hidden">
        {submissionJwt}
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {report && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            report.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="flex items-center gap-2 font-semibold">
            {report.ok ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
            {report.ok ? "Everything matches the signed receipt" : "Integrity problem found"}
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <Check ok={report.receiptValid} label={report.receiptValid ? "Signature is valid" : `Signature invalid: ${report.receiptReason}`} />
            <Check ok={report.dataMatches} label={report.dataMatches ? "Field data unchanged" : "Field data differs from the receipt"} />
            {report.faithfulnessHash && (
              <Check
                ok={!!report.faithfulnessVerified}
                label={`Faithfulness Report sealed: ${report.faithfulnessHash.slice(0, 16)}... (all pre-flight guards verified)`}
              />
            )}
            {report.files.map((f) => (
              <Check
                key={f.fileKey}
                ok={f.storedHashMatches && f.inReceipt}
                label={`${f.fileName}: ${
                  !f.storedHashMatches ? "stored bytes were altered" : !f.inReceipt ? "not in receipt" : "intact"
                }`}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      {ok ? <CheckCircle2 size={13} /> : <ShieldAlert size={13} />}
      {label}
    </li>
  );
}
