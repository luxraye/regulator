"use client";

import { useState, useEffect } from "react";
import { Shield, KeyRound, Smartphone, CheckCircle, AlertCircle, Copy, Check, Lock } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    emailVerifiedAt?: string | null;
    phoneVerifiedAt?: string | null;
    totpEnabled?: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({ type: "idle" });

  // TOTP state
  const [totpData, setTotpData] = useState<{ enabled?: boolean; secret?: string; uri?: string; currentCode?: string } | null>(null);
  const [totpInput, setTotpInput] = useState("");
  const [totpStatus, setTotpStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({ type: "idle" });
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const d = await res.json();
          setProfile(d);
        }
      } catch (err) {
        console.error(err);
      }
      try {
        const res2 = await fetch("/api/auth/totp");
        if (res2.ok) {
          const t = await res2.json();
          setTotpData(t);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", message: "New passwords do not match" });
      return;
    }
    setPwStatus({ type: "saving" });
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwStatus({ type: "error", message: data.error || "Failed to change password" });
      } else {
        setPwStatus({ type: "success", message: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwStatus({ type: "error", message: "Network error updating password" });
    }
  };

  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpStatus({ type: "saving" });
    try {
      const res = await fetch("/api/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: totpInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTotpStatus({ type: "error", message: data.error || "Failed to verify code" });
      } else {
        setTotpStatus({ type: "success", message: "Two-Factor Authentication is now enabled!" });
        setTotpData({ enabled: true });
        setTotpInput("");
      }
    } catch {
      setTotpStatus({ type: "error", message: "Network error enabling 2FA" });
    }
  };

  const handleTotpDisable = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    setTotpStatus({ type: "saving" });
    try {
      const res = await fetch("/api/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      if (res.ok) {
        setTotpStatus({ type: "success", message: "2FA disabled" });
        // Reload TOTP
        const res2 = await fetch("/api/auth/totp");
        if (res2.ok) setTotpData(await res2.json());
      }
    } catch {
      setTotpStatus({ type: "error", message: "Failed to disable 2FA" });
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-600 dark:text-neutral-400">Loading profile & security settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Shield className="text-ceda-blue dark:text-ceda-gold" size={28} />
          Profile & Account Security
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your credentials, dual-factor authentication, and communication channels.
        </p>
      </div>

      {/* Account Verification Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ceda-blue/10 dark:bg-ceda-blue/30 text-ceda-blue dark:text-ceda-gold flex items-center justify-center font-bold">
                @
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{profile.email || "demo@ceda.bw"}</p>
              </div>
            </div>
            {profile.emailVerifiedAt ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle size={12} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <AlertCircle size={12} /> Unverified
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Mobile Phone (Botswana)</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{profile.phone || "+267 72 000 000"}</p>
              </div>
            </div>
            {profile.phoneVerifiedAt ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle size={12} /> SMS Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <AlertCircle size={12} /> Pending OTP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
          <Lock className="text-ceda-blue dark:text-ceda-gold" size={20} />
          Change Password
        </h2>

        {pwStatus.message && (
          <div
            className={`p-3 rounded-lg mb-4 text-xs font-medium ${
              pwStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {pwStatus.message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ceda-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ceda-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ceda-blue"
            />
          </div>

          <button
            type="submit"
            disabled={pwStatus.type === "saving"}
            className="px-4 py-2 bg-ceda-blue hover:bg-ceda-blue-dark text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {pwStatus.type === "saving" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication (TOTP) Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <KeyRound className="text-ceda-blue dark:text-ceda-gold" size={20} />
              Two-Factor Authentication (Staff & Admin TOTP)
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Protect your account using standard RFC 6238 time-based authenticator apps (Google Authenticator, Microsoft Authenticator, 1Password).
            </p>
          </div>
          {totpData?.enabled ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              Disabled
            </span>
          )}
        </div>

        {totpStatus.message && (
          <div
            className={`p-3 rounded-lg my-4 text-xs font-medium ${
              totpStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {totpStatus.message}
          </div>
        )}

        {totpData?.enabled ? (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Two-Factor Authentication is currently protecting your account.
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Your authenticator app will be required during high-security operations.
                </p>
              </div>
              <button
                onClick={handleTotpDisable}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-100"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                1. Set up your authenticator app with this Base32 secret key:
              </p>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-sm font-mono tracking-widest text-ceda-blue dark:text-ceda-gold font-bold">
                  {totpData?.secret || "GENERATING..."}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    if (totpData?.secret) {
                      navigator.clipboard.writeText(totpData.secret);
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }
                  }}
                  className="p-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                  title="Copy secret"
                >
                  {copiedSecret ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              {totpData?.currentCode && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Hackathon Judge Demo Code:</span> The live rotating code is currently <code className="font-mono font-bold px-1.5 py-0.5 bg-white dark:bg-neutral-900 rounded">{totpData.currentCode}</code>
                </div>
              )}
            </div>

            <form onSubmit={handleTotpVerify} className="flex items-end gap-3 max-w-sm">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  2. Enter 6-digit confirmation code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-mono tracking-widest bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ceda-blue"
                />
              </div>
              <button
                type="submit"
                disabled={totpInput.length !== 6 || totpStatus.type === "saving"}
                className="px-4 py-2 bg-ceda-blue hover:bg-ceda-blue-dark text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {totpStatus.type === "saving" ? "Verifying..." : "Enable 2FA"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Useful Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/subscriptions"
          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-ceda-blue dark:hover:border-ceda-gold transition shadow-sm group"
        >
          <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-ceda-blue dark:group-hover:text-ceda-gold flex items-center justify-between">
            Manage Alert Subscriptions →
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Subscribe to automated deadline notifications and stage change digests.
          </p>
        </Link>

        <Link
          href="/demo-inbox"
          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-ceda-blue dark:hover:border-ceda-gold transition shadow-sm group"
        >
          <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-ceda-blue dark:group-hover:text-ceda-gold flex items-center justify-between">
            Open Demo Communications Inbox →
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            View simulated OTP passcodes and notification emails in real time.
          </p>
        </Link>
      </div>
    </div>
  );
}
