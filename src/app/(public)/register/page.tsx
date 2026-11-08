"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Building2, User } from "lucide-react";

type AccountType = "citizen" | "licensee";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("citizen");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        accountType,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-1.5 mb-4">
              <span className="w-3 h-3 rounded-full bg-ceda-blue" />
              <span className="w-3 h-3 rounded-full bg-ceda-green" />
              <span className="w-3 h-3 rounded-full bg-ceda-amber" />
              <span className="w-3 h-3 rounded-full bg-ceda-orange" />
            </div>
            <h1 className="text-2xl font-bold text-ceda-navy">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Choose your account type to get started
            </p>
          </div>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("citizen")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm ${
                accountType === "citizen"
                  ? "border-ceda-blue bg-ceda-blue/5 text-ceda-navy"
                  : "border-border text-muted-foreground hover:border-gray-300"
              }`}
            >
              <User className={`w-5 h-5 ${accountType === "citizen" ? "text-ceda-blue" : ""}`} />
              <span className="font-medium">Citizen</span>
              <span className="text-xs text-center leading-tight">
                Track complaints, bookmark documents
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("licensee")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm ${
                accountType === "licensee"
                  ? "border-ceda-blue bg-ceda-blue/5 text-ceda-navy"
                  : "border-border text-muted-foreground hover:border-gray-300"
              }`}
            >
              <Building2 className={`w-5 h-5 ${accountType === "licensee" ? "text-ceda-blue" : ""}`} />
              <span className="font-medium">Licensee</span>
              <span className="text-xs text-center leading-tight">
                Submit compliance data, run Instances
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ceda-blue focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ceda-blue focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ceda-blue focus:border-transparent text-sm"
                minLength={8}
                required
              />
            </div>

            {accountType === "licensee" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) => update("organizationName", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ceda-blue focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Licence Number
                  </label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => update("licenseNumber", e.target.value)}
                    placeholder="e.g. LIC-TEL-004"
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ceda-blue focus:border-transparent text-sm"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-ceda-navy text-white rounded-lg font-medium hover:bg-ceda-navy/90 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : accountType === "citizen"
                ? "Create Citizen Account"
                : "Register as Licensee"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-ceda-blue hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
