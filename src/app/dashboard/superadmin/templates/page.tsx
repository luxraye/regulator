"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  scale: string;
  dataType: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    scale: "SCALE_1",
    dataType: "TYPE_A",
    schema: '{\n  "fields": [],\n  "required_files": []\n}',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const schemaObj = JSON.parse(form.schema);
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, schema: schemaObj }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create template");
        setLoading(false);
        return;
      }

      const created = await res.json();
      setTemplates((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({ code: "", name: "", description: "", scale: "SCALE_1", dataType: "TYPE_A", schema: '{\n  "fields": [],\n  "required_files": []\n}' });
    } catch {
      setError("Invalid JSON schema");
    }
    setLoading(false);
  }

  const scaleLabel = (s: string) =>
    s === "SCALE_1" ? "Scale 1 (Large)" : s === "SCALE_2" ? "Scale 2 (Medium)" : "Scale 3 (Small)";
  const typeLabel = (t: string) =>
    t === "TYPE_A" ? "Type A (Financial)" : t === "TYPE_B" ? "Type B (Technical)" : "Type C (Public)";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">Templates</h1>
          <p className="text-muted-foreground mt-1">Manage instance templates</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Template"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. A1_2026"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Scale</label>
                <select
                  value={form.scale}
                  onChange={(e) => setForm((p) => ({ ...p, scale: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="SCALE_1">Scale 1 (Large Telecom)</option>
                  <option value="SCALE_2">Scale 2 (Medium ISP/Broadcaster)</option>
                  <option value="SCALE_3">Scale 3 (Small VANS/Courier)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Data Type</label>
                <select
                  value={form.dataType}
                  onChange={(e) => setForm((p) => ({ ...p, dataType: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="TYPE_A">Type A (Financial)</option>
                  <option value="TYPE_B">Type B (Technical)</option>
                  <option value="TYPE_C">Type C (Public Service)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Schema (JSON)</label>
              <textarea
                value={form.schema}
                onChange={(e) => setForm((p) => ({ ...p, schema: e.target.value }))}
                rows={10}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-bocra-navy text-white rounded-lg font-medium hover:bg-bocra-navy/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Template"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Code</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Scale</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Type</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-bocra-light/50">
                <td className="px-6 py-3 font-mono font-medium">{t.code}</td>
                <td className="px-6 py-3">{t.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{scaleLabel(t.scale)}</td>
                <td className="px-6 py-3 text-muted-foreground">{typeLabel(t.dataType)}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
