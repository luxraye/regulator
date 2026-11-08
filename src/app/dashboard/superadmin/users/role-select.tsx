"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const ROLES = [
  { value: "PUBLIC", label: "Citizen" },
  { value: "LICENSEE", label: "Licensee" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPERADMIN", label: "Super admin" },
];

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(next: string) {
    if (next === value) return;
    if (!confirm(`Change this user's role to ${ROLES.find((r) => r.value === next)?.label}?`)) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: next }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(data.error || "Failed");
    setValue(next);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={disabled || saving}
        onChange={(e) => change(e.target.value)}
        title={disabled ? "You can't change your own role" : undefined}
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-medium disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {saving && <Loader2 size={13} className="animate-spin" />}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
