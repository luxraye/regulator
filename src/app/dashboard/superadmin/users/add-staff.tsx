"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, UserPlus, X } from "lucide-react";

export function AddStaff() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "EVALUATOR", expertise: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not add");
    setCreated({ email: data.email, tempPassword: data.tempPassword });
    setForm({ name: "", email: "", role: "EVALUATOR", expertise: "" });
    router.refresh();
  }

  const input = "w-full rounded-lg border border-border px-3 py-2 text-sm";
  return (
    <>
      <button onClick={() => { setOpen(true); setCreated(null); }} className="inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white">
        <UserPlus size={15} /> Add staff
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex justify-between">
              <h2 className="text-lg font-semibold text-ceda-ink">Add an evaluator, adjudicator or admin</h2>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {created ? (
              <div className="space-y-3 text-sm">
                <p>Account created for <span className="font-medium">{created.email}</span>. Share this one-time password securely:</p>
                <p className="flex items-center justify-between rounded-lg bg-ceda-sand px-3 py-2 font-mono">
                  {created.tempPassword}
                  <button onClick={() => navigator.clipboard?.writeText(created.tempPassword)} aria-label="Copy password"><Copy size={14} /></button>
                </p>
                <button onClick={() => setOpen(false)} className="rounded-lg bg-ceda-ink px-4 py-2 text-white">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} aria-label="Full name" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} aria-label="Email" />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${input} bg-white`} aria-label="Role">
                  <option value="EVALUATOR">Evaluator: scores ideas</option>
                  <option value="ADJUDICATOR">Adjudicator: decides awards</option>
                  <option value="ADMIN">Programme admin: runs calls and screening</option>
                </select>
                <input placeholder="Expertise, e.g. Agribusiness finance" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} className={input} aria-label="Expertise" />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {busy && <Loader2 size={15} className="animate-spin" />} Create account
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
