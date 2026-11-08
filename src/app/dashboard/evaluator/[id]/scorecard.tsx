"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, Scale, Send } from "lucide-react";
import type { Criterion } from "@/lib/instance-schema";
import { SCORE_GUIDE, SCORE_MAX, weightedTotal } from "@/lib/scoring";
import { cn, formatDate } from "@/lib/utils";

async function patch(id: string, body: unknown) {
  const res = await fetch(`/api/evaluations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function ConflictDeclaration({ evaluationId, company, title }: { evaluationId: string; company: string; title: string }) {
  const router = useRouter();
  const [conflict, setConflict] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function declare() {
    setBusy(true);
    setError(null);
    const { ok, data } = await patch(evaluationId, { conflict, conflictNote: note });
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not save");
    router.refresh();
  }

  return (
    <section className="max-w-2xl rounded-xl border border-amber-200 bg-white p-6">
      <h2 className="mb-1 flex items-center gap-2 font-semibold text-ceda-ink"><Scale size={18} className="text-amber-600" /> Declare any conflict of interest</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Before you open this idea, confirm you have no personal, family, financial or business link to the applicant company{" "}
        <span className="font-medium text-foreground">{company}</span> or to &ldquo;{title}&rdquo;. This is recorded in the audit trail.
      </p>
      <div className="space-y-2">
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm", conflict === false ? "border-ceda-green bg-green-50" : "border-border")}>
          <input type="radio" name="conflict" checked={conflict === false} onChange={() => setConflict(false)} className="mt-0.5" />
          I have no conflict of interest and will assess this idea impartially.
        </label>
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm", conflict === true ? "border-amber-400 bg-amber-50" : "border-border")}>
          <input type="radio" name="conflict" checked={conflict === true} onChange={() => setConflict(true)} className="mt-0.5" />
          I have a conflict and need to step aside.
        </label>
      </div>
      {conflict === true && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Briefly, what is the link? (e.g. a relative is a shareholder)"
          className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
          aria-label="Conflict details"
        />
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={declare}
        disabled={busy || conflict === null || (conflict && note.trim().length < 3)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {busy && <Loader2 size={15} className="animate-spin" />} Confirm declaration
      </button>
    </section>
  );
}

export function Scorecard({
  evaluationId,
  criteria,
  initial,
  locked,
  submittedAt,
  total: savedTotal,
}: {
  evaluationId: string;
  criteria: Criterion[];
  initial: { scores: Record<string, number>; feedback: string; privateNote: string };
  locked: boolean;
  submittedAt: string | null;
  total: number | null;
}) {
  const router = useRouter();
  const [scores, setScores] = useState(initial.scores);
  const [feedback, setFeedback] = useState(initial.feedback);
  const [privateNote, setPrivateNote] = useState(initial.privateNote);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const total = useMemo(() => weightedTotal(criteria, scores), [criteria, scores]);
  const scored = criteria.filter((c) => scores[c.key]).length;

  async function save(submit: boolean) {
    if (submit && !confirm("Submit this scorecard? You can't change it afterwards.")) return;
    setBusy(submit ? "submit" : "save");
    setMsg(null);
    const { ok, data } = await patch(evaluationId, { scores, feedback, privateNote, submit });
    setBusy(null);
    if (!ok) return setMsg({ ok: false, text: data.error ?? "Could not save" });
    setMsg({ ok: true, text: submit ? "Submitted. Thank you." : "Draft saved" });
    if (submit) router.refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ceda-ink">Scorecard</h2>
          <p className="text-xs text-muted-foreground">1 to {SCORE_MAX} per criterion, weighted to 100</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-ceda-ink">{(locked ? savedTotal : total) ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{locked ? "final" : `${scored}/${criteria.length} scored`}</p>
        </div>
      </div>

      {locked && submittedAt && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 size={16} /> Submitted {formatDate(submittedAt, true)}
        </p>
      )}

      <div className="space-y-4">
        {criteria.map((c) => (
          <fieldset key={c.key} disabled={locked}>
            <legend className="flex w-full justify-between text-sm font-medium">
              <span>{c.label}</span>
              <span className="text-xs font-normal text-muted-foreground">{c.weight}%</span>
            </legend>
            {c.guide && <p className="mb-1.5 text-xs text-muted-foreground">{c.guide}</p>}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                  title={SCORE_GUIDE[n]}
                  aria-pressed={scores[c.key] === n}
                  aria-label={`${c.label}: ${n}, ${SCORE_GUIDE[n]}`}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-semibold transition-colors disabled:cursor-default",
                    scores[c.key] === n ? "border-ceda-orange bg-ceda-orange text-white" : "border-border hover:bg-ceda-sand"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            {scores[c.key] && <p className="mt-1 text-[11px] text-muted-foreground">{SCORE_GUIDE[scores[c.key]]}</p>}
          </fieldset>
        ))}

        <div>
          <label htmlFor="fb" className="mb-1 block text-sm font-medium">Feedback for the innovator</label>
          <textarea
            id="fb"
            value={feedback}
            disabled={locked}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="What is strong, and what would make it fundable? Shared anonymously after the decision."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm disabled:bg-ceda-sand"
          />
        </div>
        <div>
          <label htmlFor="pn" className="mb-1 block text-sm font-medium">Private note to the panel <span className="font-normal text-muted-foreground">(optional)</span></label>
          <textarea
            id="pn"
            value={privateNote}
            disabled={locked}
            onChange={(e) => setPrivateNote(e.target.value)}
            rows={2}
            placeholder="Only CEDA staff and the adjudication panel see this."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm disabled:bg-ceda-sand"
          />
        </div>
      </div>

      {msg && <p className={cn("mt-3 text-sm", msg.ok ? "text-green-700" : "text-red-600")}>{msg.text}</p>}
      {!locked && (
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => save(false)} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-ceda-sand disabled:opacity-50">
            {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={!!busy || total === null || feedback.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-lg bg-ceda-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "submit" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Submit scores
          </button>
        </div>
      )}
    </section>
  );
}
