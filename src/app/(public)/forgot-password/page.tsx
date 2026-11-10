"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Unable to process request");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ceda-sand px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <LogoMark className="mx-auto h-9 w-9" />
          <h1 className="text-2xl font-bold text-ceda-ink">Reset Password</h1>
          <p className="text-xs text-ceda-slate">
            Enter your email address and we will dispatch a secure link to reset your account password.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <h3 className="font-bold text-sm text-emerald-950">Password Reset Dispatched</h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              If an account is associated with <span className="font-semibold">{email}</span>, a reset link has been dispatched.
            </p>
            <div className="pt-2">
              <Link
                href="/demo-inbox"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ceda-copper hover:underline"
              >
                <span>View in Demo Inbox</span>
                <Mail size={12} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-semibold text-ceda-ink mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-ink py-3 text-sm font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              <span>{submitting ? "Sending Reset Link..." : "Send Reset Link"}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ceda-slate hover:text-ceda-ink transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
