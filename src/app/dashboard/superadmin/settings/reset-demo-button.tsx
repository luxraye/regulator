"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

export function ResetDemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setDone(null);
    setError(null);
    try {
      const res = await fetch("/api/superadmin/reset-demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not reset demo data");
      } else {
        setDone(`Demo data restored (${data.users} users, ${data.instances} ideas, ${data.threads} threads).`);
        router.refresh();
      }
    } catch {
      setError("Network error while resetting demo data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ceda-ink/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        {loading ? "Resetting demo data…" : "Reset demo data"}
      </button>
      <span className="text-xs text-muted-foreground">
        Restores all 5 demo accounts, 43 applications, evaluations and community discussions to a clean baseline.
      </span>
      {done && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ceda-green">
          <CheckCircle2 className="h-4 w-4" /> {done}
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
