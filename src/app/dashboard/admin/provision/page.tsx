"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { scaleLabels, typeLabels } from "@/lib/labels";
import type { InstanceSchema } from "@/lib/instance-schema";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scale: string;
  dataType: string;
  schema: InstanceSchema;
}

interface Licensee {
  id: string;
  name: string;
  organizationName: string | null;
  licenseNumber: string | null;
}

function defaultDeadline() {
  const d = new Date(Date.now() + 30 * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export default function ProvisionPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => (r.ok ? r.json() : [])).then(setTemplates);
    fetch("/api/users?role=LICENSEE").then((r) => (r.ok ? r.json() : [])).then(setLicensees);
  }, []);

  const template = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(null);
    setSaving(true);
    const res = await fetch("/api/instances/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, innovatorIds: selected, deadline }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not provision");
    setDone(data.created.length);
    setSelected([]);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Provision instances</h1>
        <p className="mt-1 text-muted-foreground">Send a compliance template to one or more licensees with a deadline. Each one is notified.</p>
      </div>

      {done !== null && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {done} instance{done === 1 ? "" : "s"} issued.</span>
          <Link href="/dashboard/admin/instances?filter=open" className="font-medium underline">View open instances</Link>
        </div>
      )}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-3 font-semibold text-bocra-navy">1. Template</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  templateId === t.id ? "border-bocra-blue bg-bocra-blue/5 ring-1 ring-bocra-blue" : "border-border hover:bg-bocra-light"
                )}
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">{t.code}</span> · {typeLabels[t.dataType]?.full.split(" (")[0]} · Scale {scaleLabels[t.scale]?.split(" · ")[0]}
                </p>
              </button>
            ))}
          </div>
          {template && (
            <p className="mt-3 text-xs text-muted-foreground">
              Asks for {template.schema.fields.length} fields and {template.schema.required_files.length} file
              {template.schema.required_files.length === 1 ? "" : "s"}. {template.description}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-bocra-navy">2. Licensees</h2>
            <button
              type="button"
              onClick={() => setSelected(selected.length === licensees.length ? [] : licensees.map((l) => l.id))}
              className="text-xs font-medium text-bocra-blue hover:underline"
            >
              {selected.length === licensees.length ? "Clear" : "Select all"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {licensees.map((l) => (
              <label
                key={l.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                  selected.includes(l.id) ? "border-bocra-blue bg-bocra-blue/5" : "border-border hover:bg-bocra-light"
                )}
              >
                <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-bocra-blue" />
                <span>
                  <span className="block text-sm font-medium">{l.organizationName}</span>
                  <span className="block text-xs text-muted-foreground">{l.licenseNumber ?? "—"} · {l.name}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-3 font-semibold text-bocra-navy">3. Deadline</h2>
          <input
            type="date"
            value={deadline}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
            required
          />
        </section>

        <button
          type="submit"
          disabled={saving || !templateId || selected.length === 0}
          className="flex items-center gap-2 rounded-lg bg-bocra-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-bocra-navy/90 disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Issue {selected.length || ""} instance{selected.length === 1 ? "" : "s"}
        </button>
      </form>
    </div>
  );
}
