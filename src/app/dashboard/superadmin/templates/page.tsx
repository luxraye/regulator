"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { DATA_TYPES, SCALES, scaleLabels, typeLabels } from "@/lib/labels";
import { parseSchema, type InstanceSchema } from "@/lib/instance-schema";
import { formatDate } from "@/lib/utils";

interface Template {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scale: string;
  dataType: string;
  schema: InstanceSchema;
  createdAt: string;
  _count?: { instances: number };
}

const STARTER = JSON.stringify(
  {
    fields: [
      { key: "reporting_period", label: "Reporting Period", type: "text", required: true, hint: "Q1 2026", validation: { pattern: "^Q[1-4] \\d{4}$" } },
      { key: "active_subscribers", label: "Active Subscribers", type: "number", required: true, validation: { min: 0 } },
      { key: "notes", label: "Notes", type: "textarea", required: false },
    ],
    required_files: [{ key: "supporting_report", label: "Supporting Report", extensions: [".pdf", ".xlsx"], maxSizeMB: 10 }],
  },
  null,
  2
);

const EMPTY = { code: "", name: "", description: "", scale: "SCALE_1", dataType: "TYPE_A", schema: STARTER };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const schemaCheck = useMemo(() => {
    try {
      const parsed = parseSchema(JSON.parse(form.schema));
      return parsed.error ? { error: parsed.error } : { ok: parsed.schema };
    } catch (e) {
      return { error: `Not valid JSON: ${(e as Error).message}` };
    }
  }, [form.schema]);

  const taken = templates.find((t) => t.scale === form.scale && t.dataType === form.dataType);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if ("error" in schemaCheck) return setError(schemaCheck.error!);
    setError("");
    setSaving(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, code: form.code.toUpperCase(), schema: schemaCheck.ok }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not create template");
    setTemplates((prev) => [{ ...data, _count: { instances: 0 } }, ...prev]);
    setShowForm(false);
    setForm(EMPTY);
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const input = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">Templates</h1>
          <p className="mt-1 text-muted-foreground">The forms licensees fill in. Each sits in one cell of the classification matrix.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg bg-bocra-navy px-4 py-2 text-sm font-medium text-white hover:bg-bocra-navy/90"
        >
          <Plus size={16} /> {showForm ? "Close" : "New template"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="mb-6 space-y-4 rounded-xl border border-border bg-white p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Code</label>
              <input value={form.code} onChange={set("code")} placeholder="D1_2026" className={`${input} font-mono uppercase`} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input value={form.name} onChange={set("name")} placeholder="Infrastructure Census - Major Telecom" className={input} required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input value={form.description} onChange={set("description")} className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Operator scale</label>
              <select value={form.scale} onChange={set("scale")} className={`${input} bg-white`}>
                {SCALES.map((s) => <option key={s} value={s}>{scaleLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Data type</label>
              <select value={form.dataType} onChange={set("dataType")} className={`${input} bg-white`}>
                {DATA_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t].short} · {typeLabels[t].full}</option>)}
              </select>
            </div>
          </div>
          {taken && (
            <p className="text-xs text-amber-700">
              {taken.code} already covers this cell. You can still add another, for example a new reporting year.
            </p>
          )}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium">Schema (JSON)</label>
              <span className={`text-xs ${"error" in schemaCheck ? "text-red-600" : "text-green-700"}`}>
                {"error" in schemaCheck
                  ? schemaCheck.error
                  : `${schemaCheck.ok!.fields.length} fields, ${schemaCheck.ok!.required_files.length} files`}
              </span>
            </div>
            <textarea value={form.schema} onChange={set("schema")} rows={14} spellCheck={false} className={`${input} font-mono text-xs`} />
            <p className="mt-1 text-xs text-muted-foreground">
              Field types: text, number, textarea, date, select (with &quot;options&quot;). Validation: min, max, pattern.
              Files: key, label, extensions, maxSizeMB, optional.
            </p>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-bocra-navy px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />} Create template
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((t) => (
              <li key={t.id}>
                <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-bocra-light/60">
                  {expanded === t.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="w-24 shrink-0 font-mono text-sm font-medium">{t.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {typeLabels[t.dataType]?.full} · Scale {scaleLabels[t.scale]}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {t._count?.instances ?? 0} instance{t._count?.instances === 1 ? "" : "s"} · {formatDate(t.createdAt)}
                  </span>
                </button>
                {expanded === t.id && (
                  <div className="grid gap-4 border-t border-border bg-bocra-light/40 px-5 py-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fields</p>
                      <ul className="space-y-1">
                        {t.schema.fields.map((f) => (
                          <li key={f.key}>
                            {f.label} <span className="text-xs text-muted-foreground">({f.type}{f.required ? ", required" : ""})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</p>
                      <ul className="space-y-1">
                        {t.schema.required_files.map((f) => (
                          <li key={f.key}>
                            {f.label} <span className="text-xs text-muted-foreground">({f.extensions.join(", ")} · {f.maxSizeMB} MB)</span>
                          </li>
                        ))}
                        {t.schema.required_files.length === 0 && <li className="text-muted-foreground">None</li>}
                      </ul>
                    </div>
                    {t.description && <p className="text-muted-foreground sm:col-span-2">{t.description}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
