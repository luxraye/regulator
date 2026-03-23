"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  scale: string;
  dataType: string;
}

interface Licensee {
  id: string;
  name: string;
  organizationName: string;
  email: string;
}

export default function ProvisionPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedLicensee, setSelectedLicensee] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates).catch(() => {});
    fetch("/api/users?role=LICENSEE").then((r) => r.json()).then(setLicensees).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/instances/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: selectedTemplate,
        licenseeId: selectedLicensee,
        deadline,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to provision instance");
      return;
    }

    setSuccess("Instance provisioned successfully!");
    setSelectedTemplate("");
    setSelectedLicensee("");
    setDeadline("");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Provision Instance</h1>
        <p className="text-muted-foreground mt-1">
          Assign a compliance instance to a licensee
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} - {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Licensee</label>
            <select
              value={selectedLicensee}
              onChange={(e) => setSelectedLicensee(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            >
              <option value="">Select a licensee...</option>
              {licensees.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.organizationName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-bocra-navy text-white rounded-lg font-medium hover:bg-bocra-navy/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Provisioning..." : "Provision Instance"}
          </button>
        </form>
      </div>
    </div>
  );
}
