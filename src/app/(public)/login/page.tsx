"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-1.5 mb-4">
              <span className="w-3 h-3 rounded-full bg-bocra-blue" />
              <span className="w-3 h-3 rounded-full bg-bocra-green" />
              <span className="w-3 h-3 rounded-full bg-bocra-amber" />
              <span className="w-3 h-3 rounded-full bg-bocra-orange" />
            </div>
            <h1 className="text-2xl font-bold text-bocra-navy">Sign In</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Access the BOCRA regulatory portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bocra-blue focus:border-transparent text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bocra-blue focus:border-transparent text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-bocra-navy text-white rounded-lg font-medium hover:bg-bocra-navy/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-bocra-blue hover:underline">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><span className="font-medium">SuperAdmin:</span> super@bocra.org.bw</div>
            <div><span className="font-medium">Admin:</span> admin@bocra.org.bw</div>
            <div><span className="font-medium">Licensee:</span> mascom@licensee.co.bw</div>
            <div><span className="font-medium">Citizen:</span> citizen@demo.co.bw</div>
            <div className="col-span-2"><span className="font-medium">Password (all):</span> password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
