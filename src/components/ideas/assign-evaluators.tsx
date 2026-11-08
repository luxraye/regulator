"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EvaluatorOption {
  id: string;
  name: string;
  expertise: string | null;
  open: number;
  assigned: boolean;
}

/** Pick evaluators for a screened idea. Shows each person's current open load. */
export function AssignEvaluators({ instanceId, evaluators, suggested }: { instanceId: string; evaluators: EvaluatorOption[]; suggested: number }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const already = evaluators.filter((e) => e.assigned).length;

  async function assign() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/instances/${instanceId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluatorIds: picked, days }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not assign");
    setPicked([]);
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h3 className="mb-1 flex items-center gap-2 font-semibold text-ceda-ink"><UserPlus size={17} /> Assign evaluators</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        This call asks for {suggested} independent scores. {already} assigned so far. Each evaluator declares conflicts before seeing the idea.
      </p>
      <ul className="space-y-1.5">
        {evaluators.map((e) => (
          <li key={e.id}>
            <label className={cn("flex items-center gap-3 rounded-lg border px-3 py-2 text-sm", e.assigned ? "border-border bg-ceda-sand opacity-60" : picked.includes(e.id) ? "border-ceda-orange bg-orange-50" : "border-border")}>
              <input
                type="checkbox"
                disabled={e.assigned}
                checked={e.assigned || picked.includes(e.id)}
                onChange={(ev) => setPicked((p) => (ev.target.checked ? [...p, e.id] : p.filter((x) => x !== e.id)))}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{e.name}</span>
                {e.expertise && <span className="block truncate text-xs text-muted-foreground">{e.expertise}</span>}
              </span>
              <span className="whitespace-nowrap text-xs text-muted-foreground">{e.assigned ? "assigned" : `${e.open} open`}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          Due in
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded border border-border px-2 py-1 text-sm">
            {[3, 5, 7, 10, 14].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </label>
        <button onClick={assign} disabled={busy || picked.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
          {busy && <Loader2 size={15} className="animate-spin" />} Assign {picked.length || ""}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
