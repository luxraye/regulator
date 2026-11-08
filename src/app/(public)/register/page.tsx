"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { BOTSWANA_DISTRICTS } from "@/lib/labels";

const EMPTY = {
  name: "", email: "", phone: "", password: "", omang: "", dateOfBirth: "", gender: "", district: "",
  organizationName: "", licenseNumber: "", youthShareholding: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<{ text: string; items?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, consent }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError({ text: data.error ?? "Could not register", items: data.checks?.map((c: { label: string; detail: string }) => `${c.label}: ${c.detail}`) });
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard/innovator/calls");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue";
  return (
    <div className="bg-ceda-light px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-ceda-navy">Create your innovator account</h1>
        <p className="mb-6 mt-2 text-muted-foreground">
          For Batswana aged 18 to 35 applying through a youth-owned company. Not sure? <Link href="/eligibility" className="text-ceda-blue hover:underline">Check first</Link>.
        </p>
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-white p-6">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">{error.text}</p>
              {error.items && <ul className="mt-1 list-disc pl-5">{error.items.map((i) => <li key={i}>{i}</li>)}</ul>}
            </div>
          )}
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-ceda-navy">About you</legend>
            <F id="name" label="Full name"><input id="name" required value={form.name} onChange={set("name")} className={input} autoComplete="name" /></F>
            <F id="omang" label="Omang number" hint="9 digits. Used only to confirm citizenship and age."><input id="omang" required inputMode="numeric" value={form.omang} onChange={set("omang")} className={input} /></F>
            <F id="dob" label="Date of birth"><input id="dob" type="date" required value={form.dateOfBirth} onChange={set("dateOfBirth")} className={input} /></F>
            <F id="gender" label="Gender (optional)" hint="For CEDA's inclusion reporting only.">
              <select id="gender" value={form.gender} onChange={set("gender")} className={`${input} bg-white`}>
                <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
              </select>
            </F>
            <F id="district" label="District">
              <select id="district" required value={form.district} onChange={set("district")} className={`${input} bg-white`}>
                <option value="">Choose…</option>{BOTSWANA_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </F>
            <F id="phone" label="Mobile number" hint="For SMS status alerts."><input id="phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+267 7…" className={input} autoComplete="tel" /></F>
          </fieldset>
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-ceda-navy">Your company</legend>
            <F id="org" label="Company name"><input id="org" required value={form.organizationName} onChange={set("organizationName")} className={input} /></F>
            <F id="cipa" label="CIPA registration number"><input id="cipa" required value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="BW00012345678" className={input} /></F>
            <F id="share" label="Youth shareholding (%)" hint="Share owned by people aged 18–35. Must be more than 50%."><input id="share" required type="number" min={0} max={100} value={form.youthShareholding} onChange={set("youthShareholding")} className={input} /></F>
          </fieldset>
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-ceda-navy">Sign-in</legend>
            <F id="email" label="Email"><input id="email" type="email" required value={form.email} onChange={set("email")} className={input} autoComplete="email" /></F>
            <F id="pw" label="Password" hint="At least 8 characters."><input id="pw" type="password" required minLength={8} value={form.password} onChange={set("password")} className={input} autoComplete="new-password" /></F>
          </fieldset>
          <label className="flex items-start gap-3 rounded-lg bg-ceda-light p-4 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" required />
            <span>
              <ShieldCheck size={14} className="mr-1 inline text-ceda-green" />
              I agree that CEDA may use these details to assess my applications, as set out in the <Link href="/privacy" className="text-ceda-blue underline" target="_blank">privacy notice</Link>. I can download or correct my data at any time.
            </span>
          </label>
          <button disabled={loading || !consent} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ceda-navy py-3 font-medium text-white disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />} Create account
          </button>
          <p className="text-center text-sm text-muted-foreground">Already registered? <Link href="/login" className="text-ceda-blue hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}

function F({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
    );
}
