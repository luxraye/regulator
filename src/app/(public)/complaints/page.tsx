"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  EyeOff,
  Eye,
  Search,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const providers = [
  "Mascom Wireless",
  "Orange Botswana",
  "BTC (Botswana Telecommunications Corporation)",
  "Liquid Telecom Botswana",
  "Paratus Botswana",
  "Yarona FM",
  "Duma FM",
  "Gabz FM",
  "eBotswana",
  "BotswanaPost",
  "Other",
];

const categories = [
  "Billing / Charges",
  "Service Quality",
  "Network Coverage",
  "Privacy / Data",
  "Poor Customer Service",
  "Unauthorized Charges",
  "Service Outage",
  "Contract Disputes",
  "Spam / Unsolicited Communication",
  "Other",
];

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"file" | "track">("file");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState<{ trackingCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    provider: "",
    category: "",
    description: "",
  });

  // Tracking state
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);
  const [trackError, setTrackError] = useState("");
  const [tracking, setTracking] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: any = {
      provider: form.provider,
      category: form.category,
      description: form.description,
      isAnonymous: anonymous,
    };

    if (!anonymous) {
      payload.name = form.name || session?.user?.name;
      payload.email = form.email || session?.user?.email;
      payload.phone = form.phone;
    }

    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit complaint");
      return;
    }

    const data = await res.json();
    setSubmitted({ trackingCode: data.trackingCode });
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setTrackError("");
    setTrackedComplaint(null);
    setTracking(true);

    const res = await fetch(`/api/complaints/track?code=${encodeURIComponent(trackingCode)}`);
    setTracking(false);

    if (!res.ok) {
      setTrackError("Complaint not found. Please check the tracking code.");
      return;
    }

    setTrackedComplaint(await res.json());
  }

  function copyTrackingCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Complaint Submitted</h2>
          <p className="text-green-700 mb-6">
            Thank you. BOCRA will investigate and respond within 14 working days.
          </p>

          <div className="bg-white rounded-xl border border-green-200 p-5 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Tracking Code</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-bold font-mono text-bocra-navy tracking-wider">
                {submitted.trackingCode}
              </code>
              <button
                onClick={() => copyTrackingCode(submitted.trackingCode)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Save this code to track your complaint status
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(null);
                setForm({ name: "", email: "", phone: "", provider: "", category: "", description: "" });
                setAnonymous(false);
              }}
              className="px-5 py-2.5 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
            >
              File Another Complaint
            </button>
            {session?.user?.role === "PUBLIC" && (
              <Link
                href="/dashboard/citizen/complaints"
                className="px-5 py-2.5 bg-bocra-blue text-white rounded-lg text-sm font-medium hover:bg-bocra-blue/90 transition-colors inline-flex items-center gap-2 justify-center"
              >
                View in Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-bocra-navy mb-2">Consumer Complaints</h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        BOCRA investigates complaints against communications service providers on behalf of
        the public. You can file anonymously or track an existing complaint.
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bocra-light rounded-xl mb-8">
        <button
          onClick={() => setTab("file")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "file"
              ? "bg-white text-bocra-navy shadow-sm"
              : "text-muted-foreground hover:text-bocra-navy"
          }`}
        >
          File a Complaint
        </button>
        <button
          onClick={() => setTab("track")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "track"
              ? "bg-white text-bocra-navy shadow-sm"
              : "text-muted-foreground hover:text-bocra-navy"
          }`}
        >
          Track Complaint
        </button>
      </div>

      {tab === "track" ? (
        <div>
          <form onSubmit={handleTrack} className="bg-white rounded-xl border border-border p-6">
            <label className="block text-sm font-medium mb-2">Tracking Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="e.g. BOCRA-XXXX-XXXX"
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                required
              />
              <button
                type="submit"
                disabled={tracking}
                className="px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {tracking ? "Searching..." : "Track"}
              </button>
            </div>
            {trackError && (
              <p className="text-sm text-red-600 mt-3">{trackError}</p>
            )}
          </form>

          {trackedComplaint && (
            <div className="mt-6 bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <code className="font-mono text-sm text-muted-foreground">
                  {trackedComplaint.trackingCode}
                </code>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusConfig[trackedComplaint.status]?.color || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {trackedComplaint.status === "OPEN" && <Clock className="w-3.5 h-3.5" />}
                  {trackedComplaint.status === "RESOLVED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {trackedComplaint.status === "CLOSED" && <AlertCircle className="w-3.5 h-3.5" />}
                  {statusConfig[trackedComplaint.status]?.label || trackedComplaint.status}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Provider</dt>
                  <dd className="font-medium text-bocra-navy">{trackedComplaint.provider}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Category</dt>
                  <dd className="font-medium text-bocra-navy">{trackedComplaint.category}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Filed on</dt>
                  <dd className="font-medium text-bocra-navy">
                    {new Date(trackedComplaint.createdAt).toLocaleDateString("en-BW", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                {trackedComplaint.adminNotes && (
                  <div className="bg-bocra-light rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs mb-1">BOCRA Response</dt>
                    <dd className="text-bocra-navy">{trackedComplaint.adminNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-border p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-bocra-light">
            <div className="flex items-center gap-3">
              {anonymous ? (
                <EyeOff className="w-5 h-5 text-bocra-blue" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-bocra-navy">
                  {anonymous ? "Anonymous Mode" : "Identified Mode"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {anonymous
                    ? "Your identity will not be linked to this complaint"
                    : "Your contact details will be recorded for follow-up"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                anonymous ? "bg-bocra-blue" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  anonymous ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Contact info (hidden when anonymous) */}
          {!anonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={session?.user?.name || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  required={!anonymous && !session?.user}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={session?.user?.email || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  required={!anonymous && !session?.user}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                />
              </div>
            </div>
          )}

          {/* Provider + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Service Provider</label>
              <select
                value={form.provider}
                onChange={(e) => update("provider", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                required
              >
                <option value="">Select provider...</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                required
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              placeholder="Describe your complaint in detail — what happened, when, and how it affected you..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bocra-navy text-white rounded-lg font-medium hover:bg-bocra-navy/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : anonymous
              ? "Submit Anonymously"
              : "Submit Complaint"}
          </button>

          {!session && (
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/register" className="text-bocra-blue hover:underline">
                Create a citizen account
              </Link>{" "}
              to track all your complaints from a personal dashboard.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
