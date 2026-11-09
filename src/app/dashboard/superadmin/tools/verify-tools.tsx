"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Fingerprint, Loader2, Lock, ShieldAlert } from "lucide-react";
import { hashFileClient } from "@/lib/hash-client";
import { formatDate } from "@/lib/utils";

interface HashMatch {
  fileName: string;
  fileKey: string;
  uploadedAt: string;
  instance: { id: string; status: string; template: { code: string; name: string }; innovator: { organizationName: string | null } };
}

export function HashVerifier() {
  const [hash, setHash] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ matches: HashMatch[] } | null>(null);
  const [error, setError] = useState("");

  async function lookup(h: string) {
    setBusy(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hash: h }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    setResult(data);
  }

  async function onFile(file: File) {
    setFileName(file.name);
    setBusy(true);
    const h = await hashFileClient(file);
    setHash(h);
    await lookup(h);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ceda-orange/10 text-ceda-orange"><Fingerprint size={18} /></span>
        <div>
          <h3 className="font-semibold text-ceda-navy">File hash verifier</h3>
          <p className="text-xs text-muted-foreground">Drop in a document someone sent you to see whether it matches a submitted file.</p>
        </div>
      </div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-4 py-6 text-center text-sm hover:border-ceda-blue/50 hover:bg-ceda-light/50">
        <span className="font-medium text-ceda-navy">{fileName ?? "Choose a file"}</span>
        <span className="text-xs text-muted-foreground">Hashed in your browser. The file itself is not uploaded.</span>
        <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      <div className="mt-3 flex gap-2">
        <input
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="…or paste a SHA-256 hash"
          aria-label="SHA-256 hash"
          className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ceda-blue"
        />
        <button onClick={() => lookup(hash)} disabled={busy || !hash} className="rounded-lg bg-ceda-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40">
          {busy ? <Loader2 size={15} className="animate-spin" /> : "Check"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {result && (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${result.matches.length ? "border-green-200 bg-green-50 text-green-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          {result.matches.length === 0 ? (
            <p className="flex items-center gap-2"><ShieldAlert size={15} /> No submitted file has this hash. It is not an original submission to the portal, or it was altered.</p>
          ) : (
            <>
              <p className="flex items-center gap-2 font-medium"><CheckCircle2 size={15} /> Matches {result.matches.length} submitted file{result.matches.length > 1 ? "s" : ""}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {result.matches.map((m, i) => (
                  <li key={i}>
                    <Link href={`/dashboard/admin/instances/${m.instance.id}`} className="underline">
                      {m.fileName}
                    </Link>{" "}
                    · {m.instance.template.code} · {m.instance.innovator.organizationName} · uploaded {formatDate(m.uploadedAt)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface TokenResult {
  valid: boolean;
  reason?: string;
  matchesStored: boolean;
  payload: Record<string, unknown> | null;
  integrity: { ok: boolean } | null;
}

export function ReceiptInspector() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TokenResult | null>(null);
  const [error, setError] = useState("");

  async function check() {
    setBusy(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    setResult(data);
  }

  const verdict = result && (result.valid && result.matchesStored && result.integrity?.ok);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700"><Lock size={18} /></span>
        <div>
          <h3 className="font-semibold text-ceda-navy">Receipt inspector</h3>
          <p className="text-xs text-muted-foreground">Paste a submission receipt an innovator shared to confirm it is genuine and current.</p>
        </div>
      </div>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        placeholder="eyJhbGciOiJIUzI1NiIs…"
        aria-label="Submission receipt token"
        className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ceda-blue"
      />
      <button onClick={check} disabled={busy || !token.trim()} className="mt-2 flex items-center gap-2 rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
        {busy && <Loader2 size={14} className="animate-spin" />} Verify receipt
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {result && (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${verdict ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          <p className="flex items-center gap-2 font-medium">
            {verdict ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}
            {verdict
              ? "Genuine receipt for the current submission"
              : !result.valid
                ? `Not a valid CEDA portal receipt (${result.reason})`
                : !result.matchesStored
                  ? "Signature is valid, but this is not the latest receipt for that idea (it was resubmitted)"
                  : "Receipt is valid, but the stored data no longer matches it"}
          </p>
          {result.payload && (
            <pre className="mt-2 max-h-56 overflow-auto rounded bg-white/70 p-2 text-[11px] text-ceda-navy">
              {JSON.stringify(result.payload, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
