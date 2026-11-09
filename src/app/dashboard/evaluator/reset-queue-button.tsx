"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

export function ResetEvaluatorQueueButton({ label = "Restore demo queue (10 to score)" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function resetQueue() {
    setBusy(true);
    setDone(false);
    try {
      const res = await fetch("/api/evaluations/reset-demo", { method: "POST" });
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={resetQueue}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-ceda-ink shadow-sm transition-colors hover:border-ceda-orange hover:text-ceda-orange disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
        {busy ? "Restoring queue…" : label}
      </button>
      {done && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ceda-green">
          <CheckCircle2 size={13} /> Queue restored
        </span>
      )}
    </div>
  );
}
