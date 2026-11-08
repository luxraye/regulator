"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ACTIONS = [
  { status: "APPROVED", label: "Approve", className: "bg-bocra-green hover:bg-bocra-green/90" },
  { status: "FLAGGED", label: "Request changes", className: "bg-bocra-orange hover:bg-bocra-orange/90" },
  { status: "REJECTED", label: "Reject", className: "bg-red-600 hover:bg-red-700" },
] as const;

export function ReviewActions({ instanceId }: { instanceId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function review(status: string) {
    setError("");
    if (status !== "APPROVED" && !notes.trim()) {
      setError("Add a note so the licensee knows what to fix.");
      return;
    }
    if (status === "REJECTED" && !confirm("Reject this submission? The licensee will not be able to resubmit it.")) return;
    setBusy(status);
    const res = await fetch(`/api/instances/${instanceId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNotes: notes }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "Review failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border-2 border-bocra-blue/30 bg-white p-5">
      <h3 className="font-semibold text-bocra-navy">Your review</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        &ldquo;Request changes&rdquo; reopens the instance so the licensee can fix it and resubmit.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Notes for the licensee (required unless approving)"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.status}
            onClick={() => review(a.status)}
            disabled={!!busy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${a.className}`}
          >
            {busy === a.status && <Loader2 size={14} className="animate-spin" />}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
