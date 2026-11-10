"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

export default function OtpLoginPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [step, setStep] = useState<"DESTINATION" | "CODE">("DESTINATION");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setStep("CODE");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");

      // Auto sign-in with credentials using demo password
      const result = await signIn("credentials", {
        email: data.user.email,
        password: "CedaDemo2026!",
        redirect: false,
      });

      if (result?.error) {
        // If password doesn't match fallback, route to login with verified notice
        router.push("/login?verified=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ceda-sand px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <LogoMark className="mx-auto h-9 w-9" />
          <h1 className="text-2xl font-bold text-ceda-ink">One-Time Sign In</h1>
          <p className="text-xs text-ceda-slate">
            Passwordless sign-in via single-use email or SMS verification code.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        {step === "DESTINATION" ? (
          <form onSubmit={handleSendCode} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ceda-ink mb-1">
                Email Address or Mobile Phone Number
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="you@example.com or +267 71 234 567"
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-ceda-slate border border-border">
              <span className="font-semibold text-ceda-ink block mb-0.5">Judging Sandbox</span>
              Outgoing codes deliver immediately to the{" "}
              <Link href="/demo-inbox" target="_blank" className="font-bold text-ceda-copper underline">
                Live Demo Inbox
              </Link>
              .
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-ink py-3 text-sm font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              <span>{loading ? "Sending Passcode..." : "Send Verification Code"}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-ceda-ink">
                  Enter 6-Digit Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setStep("DESTINATION")}
                  className="text-ceda-orange hover:underline text-[11px]"
                >
                  Change recipient
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-center font-mono text-xl tracking-widest font-extrabold text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
                autoFocus
              />
              <p className="text-[11px] text-ceda-slate mt-1 text-center">
                Dispatched to <span className="font-semibold text-ceda-ink">{destination}</span>
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-border">
              <Link href="/demo-inbox" target="_blank" className="font-bold text-ceda-copper text-xs hover:underline">
                Open /demo-inbox to view code →
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-orange py-3 text-sm font-bold text-white shadow hover:bg-ceda-copper transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border">
          <Link
            href="/login"
            className="text-xs font-semibold text-ceda-slate hover:text-ceda-ink transition"
          >
            Use standard password sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
