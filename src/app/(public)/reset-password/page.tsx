"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ceda-sand px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <LogoMark className="mx-auto h-9 w-9" />
          <h1 className="text-2xl font-bold text-ceda-ink">Set New Password</h1>
          <p className="text-xs text-ceda-slate">
            Choose a new secure password for your CEDA Innovation Portal account.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <h3 className="font-bold text-sm text-emerald-950">Password Successfully Updated</h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Your password has been reset. You may now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ceda-ink py-2.5 text-xs font-bold text-white shadow hover:bg-black transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={14} />
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
              <label className="block font-semibold text-ceda-ink mb-1">
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-ceda-ink mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-ink py-3 text-sm font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              <span>{submitting ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
