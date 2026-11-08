"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, X } from "lucide-react";

/** "Start application" button that asks for a working title, then opens the form. */
export function StartApplication({ templateId, callName }: { templateId: string; callName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; items?: string[] } | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, title }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.id) return router.push(`/dashboard/innovator/instance-runner/${data.id}`);
    if (!res.ok) {
      setBusy(false);
      setError({ text: data.error ?? "Could not start", items: data.checks?.map((c: { label: string; detail: string }) => `${c.label}: ${c.detail}`) });
      return;
    }
    router.push(`/dashboard/innovator/instance-runner/${data.id}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-ceda-blue px-4 py-2 text-sm font-medium text-white hover:bg-ceda-blue/90"
      >
        Start application <ArrowRight size={15} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="start-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="start-title" className="text-lg font-semibold text-ceda-navy">Start your application</h2>
                <p className="text-sm text-muted-foreground">{callName}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-ceda-light">
                <X size={18} />
              </button>
            </div>
            <label htmlFor="new-title" className="mb-1.5 block text-sm font-medium">Working title for your idea</label>
            <input
              id="new-title"
              autoFocus
              value={title}
              maxLength={140}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && title.trim().length >= 4 && start()}
              placeholder="e.g. Mobile cold storage for Kgatleng horticulture"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue"
            />
            <p className="mt-1 text-xs text-muted-foreground">You can change it before you submit. Your draft saves as you go.</p>
            {error && (
              <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">{error.text}</p>
                {error.items && <ul className="mt-1 list-disc pl-5">{error.items.map((i) => <li key={i}>{i}</li>)}</ul>}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-ceda-light">Cancel</button>
              <button
                onClick={start}
                disabled={busy || title.trim().length < 4}
                className="inline-flex items-center gap-2 rounded-lg bg-ceda-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />} Create draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
