"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { DATA_TYPES, SCALES, scaleLabels, sectorName, stageName, typeLabels } from "@/lib/labels";
import { parseSchema, type Criterion, type InstanceSchema } from "@/lib/instance-schema";
import { DEFAULT_CRITERIA, DEFAULT_FORM } from "@/lib/call-defaults";
import { cn, formatDate } from "@/lib/utils";

interface Call {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scale: string;
  dataType: string;
  schema: InstanceSchema;
  status: "DRAFT" | "OPEN" | "CLOSED";
  closesAt: string;
  fundingSummary: string | null;
  reviewersPerIdea: number;
  createdAt: string;
  _count?: { instances: number };
}

const inFour = () => new Date(Date.now() + 28 * 86_400_000).toISOString().slice(0, 10);
const EMPTY = {
  code: "",
  name: "",
  description: "",
  scale: "SCALE_1",
  dataType: "TYPE_A",
  closesAt: inFour(),
  fundingSummary: "",
  reviewersPerIdea: 3,
  form: JSON.stringify(DEFAULT_FORM, null, 2),
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30) || "criterion";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCalls)
      .finally(() => setLoading(false));
  }, []);

  const schemaCheck = useMemo(() => {
    try {
      const parsed = parseSchema({ ...JSON.parse(form.form), criteria });
      return parsed.error ? { error: parsed.error } : { ok: parsed.schema };
    } catch (e) {
      return { error: `Form JSON: ${(e as Error).message}` };
    }
  }, [form.form, criteria]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if ("error" in schemaCheck) return setError(schemaCheck.error!);
    setError("");
    setSaving(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, code: form.code.toUpperCase(), schema: schemaCheck.ok, closesAt: `${form.closesAt}T23:59:00+02:00` }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not create the call");
    setCalls((prev) => [{ ...data, _count: { instances: 0 } }, ...prev]);
    setShowForm(false);
    setForm(EMPTY);
    setCriteria(DEFAULT_CRITERIA);
  }

  async function setStatus(id: string, status: Call["status"]) {
    const res = await fetch("/api/templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) setCalls((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const input = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ceda-navy">Calls for ideas</h1>
          <p className="mt-1 text-muted-foreground">Each call targets one sector and venture stage, with its own form, closing date and scoring criteria.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white hover:bg-ceda-navy/90">
          <Plus size={16} /> {showForm ? "Close" : "New call"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="mb-6 space-y-5 rounded-xl border border-border bg-white p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Code"><input value={form.code} onChange={set("code")} placeholder="WATER_2027" className={`${input} font-mono uppercase`} required /></Field>
            <Field label="Name" className="sm:col-span-2"><input value={form.name} onChange={set("name")} placeholder="Water Security Innovation Challenge" className={input} required /></Field>
          </div>
          <Field label="Who should apply, and what CEDA wants to fund"><textarea value={form.description} onChange={set("description")} rows={2} className={input} /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Sector">
              <select value={form.dataType} onChange={set("dataType")} className={`${input} bg-white`}>
                {DATA_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t].full}</option>)}
              </select>
            </Field>
            <Field label="Venture stage">
              <select value={form.scale} onChange={set("scale")} className={`${input} bg-white`}>
                {SCALES.map((s) => <option key={s} value={s}>{scaleLabels[s]}</option>)}
              </select>
            </Field>
            <Field label="Closes"><input type="date" value={form.closesAt} onChange={set("closesAt")} className={input} required /></Field>
            <Field label="Evaluators per idea">
              <select value={form.reviewersPerIdea} onChange={set("reviewersPerIdea")} className={`${input} bg-white`}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Funding on offer"><input value={form.fundingSummary} onChange={set("fundingSummary")} placeholder="Grants up to P300,000 plus 12 months of mentorship" className={input} /></Field>

          <CriteriaEditor criteria={criteria} onChange={setCriteria} />

          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-sm font-medium">Application form (advanced)</summary>
            <p className="mb-2 mt-2 text-xs text-muted-foreground">
              Starts with the standard CEDA questions. Field types: text, number, textarea, date, select. Files: key, label, extensions, maxSizeMB, optional.
            </p>
            <textarea value={form.form} onChange={set("form")} rows={14} spellCheck={false} aria-label="Application form JSON" className={`${input} font-mono text-xs`} />
          </details>
          <div className="flex items-center justify-between gap-3">
            <span className={cn("text-xs", "error" in schemaCheck ? "text-red-600" : "text-green-700")}>
              {"error" in schemaCheck ? schemaCheck.error : `${schemaCheck.ok!.fields.length} questions, ${schemaCheck.ok!.required_files.length} documents, ${criteria.length} criteria`}
            </span>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-ceda-navy px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />} Publish call
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y divide-border">
            {calls.map((c) => (
              <li key={c.id}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={expanded === c.id}>
                    {expanded === c.id ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        <span className="font-mono">{c.code}</span> · {sectorName(c.dataType)} · {stageName(c.scale)} · closes {formatDate(c.closesAt)} · {c._count?.instances ?? 0} applications
                      </span>
                    </span>
                  </button>
                  <select
                    value={c.status}
                    onChange={(e) => setStatus(c.id, e.target.value as Call["status"])}
                    aria-label={`Status of ${c.code}`}
                    className={cn(
                      "rounded-full border-0 px-2.5 py-1 text-xs font-medium",
                      c.status === "OPEN" ? "bg-green-100 text-green-800" : c.status === "CLOSED" ? "bg-gray-200 text-gray-700" : "bg-amber-100 text-amber-800"
                    )}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                {expanded === c.id && <CallDetail call={c} onCriteria={(criteria) => setCalls((cs) => cs.map((x) => (x.id === c.id ? { ...x, schema: { ...x.schema, criteria } } : x)))} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CallDetail({ call, onCriteria }: { call: Call; onCriteria: (c: Criterion[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [criteria, setCriteria] = useState(call.schema.criteria);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    const res = await fetch("/api/templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: call.id, criteria }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data.error ?? "Could not save");
    onCriteria(data.criteria);
    setEditing(false);
  }

  return (
    <div className="grid grid-cols-1 gap-5 border-t border-border bg-ceda-light/40 px-5 py-4 text-sm lg:grid-cols-3">
      <div className="lg:col-span-1">
        {call.description && <p className="mb-2 text-muted-foreground">{call.description}</p>}
        {call.fundingSummary && <p><span className="font-medium">Funding:</span> {call.fundingSummary}</p>}
        <p><span className="font-medium">Evaluators per idea:</span> {call.reviewersPerIdea}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents</p>
        <ul className="mt-1 space-y-0.5">
          {call.schema.required_files.map((f) => <li key={f.key}>{f.label}{f.optional && <span className="text-muted-foreground"> (optional)</span>}</li>)}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</p>
        <ul className="space-y-0.5">
          {call.schema.fields.map((f) => <li key={f.key}>{f.label}</li>)}
        </ul>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scoring criteria</p>
          {!editing && <button onClick={() => setEditing(true)} className="text-xs font-medium text-ceda-blue hover:underline">Edit</button>}
        </div>
        {editing ? (
          <>
            <CriteriaEditor criteria={criteria} onChange={setCriteria} compact />
            {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
            <div className="mt-2 flex gap-2">
              <button onClick={save} className="rounded-lg bg-ceda-navy px-3 py-1.5 text-xs font-medium text-white">Save criteria</button>
              <button onClick={() => { setEditing(false); setCriteria(call.schema.criteria); }} className="rounded-lg px-3 py-1.5 text-xs">Cancel</button>
            </div>
          </>
        ) : (
          <ul className="space-y-1">
            {call.schema.criteria.map((c) => (
              <li key={c.key} className="flex justify-between gap-2"><span>{c.label}</span><span className="font-medium">{c.weight}%</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CriteriaEditor({ criteria, onChange, compact }: { criteria: Criterion[]; onChange: (c: Criterion[]) => void; compact?: boolean }) {
  const total = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  const update = (i: number, patch: Partial<Criterion>) => onChange(criteria.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <fieldset className={cn(!compact && "rounded-lg border border-border p-4")}>
      {!compact && <legend className="px-1 text-sm font-medium">Scoring criteria</legend>}
      <div className="space-y-2">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <input
                value={c.label}
                onChange={(e) => update(i, { label: e.target.value, key: slug(e.target.value) })}
                aria-label="Criterion"
                className="w-full rounded border border-border bg-white px-2 py-1 text-sm"
              />
              {!compact && (
                <input value={c.guide ?? ""} onChange={(e) => update(i, { guide: e.target.value })} placeholder="Guidance for evaluators" aria-label="Guidance" className="w-full rounded border border-border bg-white px-2 py-1 text-xs" />
              )}
            </div>
            <input
              type="number"
              value={c.weight}
              min={1}
              max={100}
              onChange={(e) => update(i, { weight: Number(e.target.value) })}
              aria-label="Weight"
              className="w-16 rounded border border-border bg-white px-2 py-1 text-right text-sm"
            />
            <span className="pt-1 text-xs text-muted-foreground">%</span>
            <button type="button" onClick={() => onChange(criteria.filter((_, j) => j !== i))} aria-label="Remove criterion" className="p-1 text-muted-foreground hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={() => onChange([...criteria, { key: `criterion_${criteria.length + 1}`, label: "New criterion", weight: 10 }])} className="text-xs font-medium text-ceda-blue hover:underline">
          + Add criterion
        </button>
        <span className={cn("text-xs font-medium", total === 100 ? "text-green-700" : "text-red-600")}>Total {total}% {total !== 100 && "(must be 100)"}</span>
      </div>
    </fieldset>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
