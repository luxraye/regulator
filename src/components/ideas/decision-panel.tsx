"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Loader2 } from "lucide-react";
import { ACTION_LABELS } from "@/lib/decisions";
import { cn } from "@/lib/utils";

/** The decisions the signed-in person can take on this idea right now. */
export function DecisionPanel({
  instanceId,
  actions,
  suggestedAward,
  title = "Decision",
}: {
  instanceId: string;
  actions: string[];
  suggestedAward?: number | null;
  title?: string;
}) {
  const router = useRouter();
  const [action, setAction] = useState<string | null>(actions.length === 1 ? actions[0] : null);
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState(suggestedAward ? String(suggestedAward) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (actions.length === 0) return null;
  const needsNotes = action !== "SEND_TO_PANEL";

  async function decide() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/instances/${instanceId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, awardAmount: action === "AWARD" ? amount : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not save the decision");
    setAction(null);
    setNotes("");
    router.refresh();
  }

  return (
    <section className="rounded-xl border-2 border-ceda-orange/30 bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-ceda-ink"><Gavel size={17} /> {title}</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity",
              ACTION_LABELS[a].tone,
              action && action !== a ? "opacity-40" : "opacity-100"
            )}
          >
            {ACTION_LABELS[a].label}
          </button>
        ))}
      </div>
      {action && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">{ACTION_LABELS[action].hint}</p>
          {action === "AWARD" && (
            <div>
              <label htmlFor="award" className="mb-1 block text-sm font-medium">Award amount (Pula)</label>
              <input
                id="award"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-48 rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          )}
          {needsNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={action === "REQUEST_CHANGES" ? "What should the innovator change?" : "Reason, shared with the innovator"}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              aria-label="Decision notes"
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setAction(null)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-ceda-sand">Cancel</button>
            <button
              onClick={decide}
              disabled={busy || (needsNotes && notes.trim().length < 10) || (action === "AWARD" && !Number(amount))}
              className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40", ACTION_LABELS[action].tone)}
            >
              {busy && <Loader2 size={15} className="animate-spin" />} Confirm: {ACTION_LABELS[action].label}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
