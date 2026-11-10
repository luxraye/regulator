"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Gavel, Lightbulb, Loader2, Settings2, ShieldCheck, Building2, Radio, Headset, Eye } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

/** Demo accounts for hackathon judges. Turn off with NEXT_PUBLIC_SHOW_DEMO_LOGINS=false. */
const DEMO = [
  { email: "innovator@demo.ceda.bw", role: "Innovator", who: "Naledi Molefe: one award, one idea needing changes", icon: <Lightbulb size={16} /> },
  { email: "evaluator@demo.ceda.bw", role: "Evaluator", who: "Dr Keabetswe Ntshole: ideas waiting to be scored", icon: <ClipboardList size={16} /> },
  { email: "panel@demo.ceda.bw", role: "Adjudicator", who: "Mma Dineo Seabo: ranked shortlist to decide", icon: <Gavel size={16} /> },
  { email: "admin@demo.ceda.bw", role: "Programme admin", who: "Tebogo Ramasedi: screening, calls and reports", icon: <Settings2 size={16} /> },
  { email: "super@demo.ceda.bw", role: "Super admin", who: "Kgosi Mothibi: people, audit and verification", icon: <ShieldCheck size={16} /> },
  { email: "bdih.admin@demo.ceda.bw", role: "Partner Admin (BDIH)", who: "Kagiso Moeti: BDIH Innovation Hub space", icon: <Building2 size={16} /> },
  { email: "btc.admin@demo.ceda.bw", role: "Partner Admin (BTC)", who: "Naledi Modise: BTC Telecoms 5G Challenge", icon: <Radio size={16} /> },
  { email: "consultant@demo.ceda.bw", role: "Consultant", who: "Neo Molefe: live chat queue & applicant advisory", icon: <Headset size={16} /> },
  { email: "observer@demo.ceda.bw", role: "Committee Observer", who: "Boitumelo Kgosiemang: live audit & statutory oversight", icon: <Eye size={16} /> },
];
const DEMO_PASSWORD = "CedaDemo2026!";
const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS !== "false";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function login(e: string, p: string) {
    setError("");
    setLoading(e);
    const result = await signIn("credentials", { email: e, password: p, redirect: false });
    if (result?.error) {
      setLoading(null);
      setError("Invalid email or password");
      return;
    }
    const callback = new URLSearchParams(window.location.search).get("callbackUrl");
    router.push(callback && callback.startsWith("/") && !callback.startsWith("//") ? callback : "/dashboard");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ceda-orange";
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ceda-sand px-4 py-10">
      <div className="grid w-full min-w-0 max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <LogoMark className="mx-auto mb-4 h-8 w-8" />
            <h1 className="text-2xl font-bold text-ceda-ink">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">CEDA Innovation Portal</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); login(email, password); }} className="space-y-4">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-ceda-orange hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={!!loading} className="w-full rounded-lg bg-ceda-ink py-2.5 font-medium text-white transition-colors hover:bg-ceda-ink/90 disabled:opacity-50">
              {loading === email ? "Signing in…" : "Sign in"}
            </button>
            <div className="text-center pt-1">
              <Link href="/otp-login" className="text-xs font-semibold text-ceda-ink hover:text-ceda-orange transition">
                Sign in with SMS or Email OTP →
              </Link>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New innovator? <Link href="/register" className="text-ceda-orange hover:underline">Create an account</Link>
          </p>
        </div>

        {SHOW_DEMO && (
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="font-semibold text-ceda-ink">Try it as any role</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Judges: pick any role below to explore. Password for all: <code className="rounded bg-ceda-sand px-1 font-semibold text-ceda-ink">{DEMO_PASSWORD}</code>
            </p>
            <ul className="space-y-2">
              {DEMO.map((d) => (
                <li key={d.email}>
                  <button
                    onClick={() => login(d.email, DEMO_PASSWORD)}
                    disabled={!!loading}
                    className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:border-ceda-orange hover:bg-blue-50 disabled:opacity-60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ceda-orange/10 text-ceda-orange">
                      {loading === d.email ? <Loader2 size={16} className="animate-spin" /> : d.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ceda-ink">{d.role}</span>
                      <span className="block truncate text-xs text-muted-foreground">{d.who}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-ceda-copper/20 bg-ceda-sand/70 p-3 text-center text-xs">
              <span className="font-semibold text-ceda-ink block mb-0.5">Judging Verification Sandbox</span>
              <Link href="/demo-inbox" target="_blank" className="font-bold text-ceda-copper hover:underline inline-flex items-center gap-1">
                <span>View Delivered OTPs & Email Links in /demo-inbox</span>
                <span className="font-mono">→</span>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              New to the evaluation walkthrough? <Link href="/about#how-to-judge" className="font-medium text-ceda-orange hover:underline">How to judge this portal (2-minute path per role)</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
