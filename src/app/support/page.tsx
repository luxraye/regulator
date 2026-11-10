"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Send,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { REGULATORY_AUTHORITIES } from "@/lib/regulators";

interface TicketData {
  referenceCode: string;
  name: string;
  email: string;
  severity: "P1" | "P2" | "P3";
  category: string;
  subject: string;
  status: string;
  resolutionNotes?: string | null;
  createdAt: string;
}

export default function SupportPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  // Ticket Lookup State
  const [searchRef, setSearchRef] = useState(initialRef);
  const [searchedTicket, setSearchedTicket] = useState<TicketData | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [severity, setSeverity] = useState<"P1" | "P2" | "P3">("P2");
  const [category, setCategory] = useState("Hosting Fault / Service Interruption");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<TicketData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLookup = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/support/tickets?ref=${encodeURIComponent(codeToSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ticket not found");
      setSearchedTicket(data.ticket);
    } catch (err: any) {
      setLookupError(err.message);
      setSearchedTicket(null);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          severity,
          category,
          subject,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket");

      setSubmittedTicket(data.ticket);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setDescription("");
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
          Service Level Commitment
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ceda-ink sm:text-4xl">
          Support & Hosting Fault Resolution Desk
        </h1>
        <p className="text-sm text-ceda-slate leading-relaxed">
          Transparent incident management, defined response SLAs, and dedicated technical assistance for Botswana youth innovators and evaluators.
        </p>
      </div>

      {/* SLA Turnaround Matrix */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Clock size={20} className="text-ceda-orange" />
          <h2 className="text-lg font-bold text-ceda-ink">Service Level Turnaround Commitments</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-rose-200 px-2 py-0.5 font-bold text-xs text-rose-900">
                P1 Critical
              </span>
              <span className="text-[11px] font-bold text-rose-700">Outage</span>
            </div>
            <p className="font-bold text-xs text-rose-950">Portal Outage / Critical Inaccessibility</p>
            <div className="space-y-1 text-xs text-rose-900 pt-1">
              <div>• Initial Response: <span className="font-bold">Within 2 hours</span></div>
              <div>• Resolution Target: <span className="font-bold">Within 8 hours</span></div>
              <div className="text-[10px] text-rose-700 italic">24/7 on-call engineering engagement</div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-amber-200 px-2 py-0.5 font-bold text-xs text-amber-900">
                P2 Major
              </span>
              <span className="text-[11px] font-bold text-amber-700">Degraded</span>
            </div>
            <p className="font-bold text-xs text-amber-950">Submission Obstruction / Scorer Lock</p>
            <div className="space-y-1 text-xs text-amber-900 pt-1">
              <div>• Initial Response: <span className="font-bold">Within 4 hours</span></div>
              <div>• Resolution Target: <span className="font-bold">Within 24 hours</span></div>
              <div className="text-[10px] text-amber-700 italic">Active during operational hours</div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-200 px-2 py-0.5 font-bold text-xs text-blue-900">
                P3 Minor
              </span>
              <span className="text-[11px] font-bold text-blue-700">Inquiry</span>
            </div>
            <p className="font-bold text-xs text-blue-950">General Question / Account Clarification</p>
            <div className="space-y-1 text-xs text-blue-900 pt-1">
              <div>• Initial Response: <span className="font-bold">Within 24 hours</span></div>
              <div>• Resolution Target: <span className="font-bold">3 working days</span></div>
              <div className="text-[10px] text-blue-700 italic">Business hours (08:00 - 17:00 CAT)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Tracking Search Box */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Search size={18} className="text-ceda-copper" />
          <h2 className="text-base font-bold text-ceda-ink">Track Ticket Status</h2>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleLookup(searchRef); }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Enter reference code (e.g. CEDA-SUP-A1B2C3)"
            className="flex-1 rounded-xl border border-border px-3.5 py-2.5 text-xs font-mono uppercase text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
            required
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-ceda-ink px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
          >
            {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Lookup Status</span>
          </button>
        </form>

        {lookupError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {lookupError}
          </div>
        )}

        {searchedTicket && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-950">{searchedTicket.subject}</span>
              <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 font-bold text-[11px] text-emerald-900">
                {searchedTicket.status}
              </span>
            </div>
            <div className="text-emerald-900">
              Reference: <code className="font-mono font-bold">{searchedTicket.referenceCode}</code> • Severity: <span className="font-bold">{searchedTicket.severity}</span>
            </div>
            <div className="text-ceda-slate text-[11px]">
              Logged: {formatDate(searchedTicket.createdAt)}
            </div>
            {searchedTicket.resolutionNotes && (
              <div className="mt-2 rounded-lg bg-white p-2.5 border border-emerald-300 text-emerald-950">
                <span className="font-bold block mb-0.5">Resolution Notes:</span>
                {searchedTicket.resolutionNotes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fault Report Form */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <LifeBuoy size={22} className="text-ceda-orange" />
            <div>
              <h2 className="text-xl font-bold text-ceda-ink">Report a Fault or Service Issue</h2>
              <p className="text-xs text-ceda-slate">A support engineer will be dispatched per the SLA turnaround table above.</p>
            </div>
          </div>
        </div>

        {submittedTicket ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <h3 className="font-bold text-lg text-emerald-950">Ticket Logged Successfully</h3>
            <p className="text-xs text-emerald-900 max-w-md mx-auto">
              Your ticket reference code is <code className="rounded bg-white px-2 py-0.5 font-bold font-mono text-emerald-950 border border-emerald-300">{submittedTicket.referenceCode}</code>.
              A confirmation email has been dispatched to your email and captured in the <Link href="/demo-inbox" target="_blank" className="underline font-bold">Demo Inbox</Link>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSubmittedTicket(null)}
                className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Naledi Molefe"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none bg-white"
                >
                  <option value="P1">P1 Critical Outage (2h response / 8h fix)</option>
                  <option value="P2">P2 Major Degraded (4h response / 24h fix)</option>
                  <option value="P3">P3 Minor Inquiry (24h response / 3 working days)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none bg-white"
                >
                  <option value="Hosting Fault / Service Interruption">Hosting Fault / Service Interruption</option>
                  <option value="Submission / Upload Failure">Submission / Upload Failure</option>
                  <option value="Account / Verification Issue">Account / Verification Issue</option>
                  <option value="Evaluation & Scoring Inquiries">Evaluation & Scoring Inquiries</option>
                  <option value="General Technical Question">General Technical Question</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ceda-ink mb-1">Subject / Summary</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of fault"
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-ceda-ink mb-1">Detailed Description & Error Message</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Include steps to reproduce, URLs, or error messages encountered..."
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-ceda-orange px-6 py-3 text-sm font-bold text-white shadow hover:bg-ceda-copper transition disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{submitting ? "Submitting Ticket..." : "Submit Fault Report"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Regulatory Authorities Contacts Directory */}
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ceda-copper">Compliance & Statutory Governance</span>
          <h2 className="text-xl font-black text-ceda-ink">Botswana Regulatory Authorities Directory</h2>
          <p className="text-xs text-ceda-slate mt-1">
            Official contacts for legal registration, tax compliance, technical standards, consumer protection, and sector licensing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REGULATORY_AUTHORITIES.map((reg) => (
            <div
              key={reg.acronym}
              className="rounded-xl border border-border/80 bg-neutral-50/50 p-4 space-y-2 hover:border-ceda-blue transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black px-2 py-0.5 rounded bg-ceda-blue text-white">
                    {reg.acronym}
                  </span>
                  <span className="text-xs font-bold text-ceda-ink">{reg.name}</span>
                </div>
                {reg.verified ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1"
                    title={reg.verificationNotes}
                  >
                    <AlertTriangle size={10} /> Pending
                  </span>
                )}
              </div>

              <p className="text-xs text-ceda-slate leading-relaxed">{reg.mandate}</p>

              <div className="pt-2 border-t border-border/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Website:</span>
                  <a
                    href={reg.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-ceda-blue hover:underline"
                  >
                    {reg.website.replace("https://", "")}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Phone:</span>
                  <span className="font-semibold text-ceda-ink">{reg.phone}</span>
                </div>
                <div className="text-[11px] text-neutral-500 pt-0.5">
                  <span className="font-medium">Office:</span> {reg.physicalAddress}
                </div>
                {reg.verificationNotes && (
                  <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                    {reg.verificationNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Hours & Emergency Contacts Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-border bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-ceda-ink">
            <Phone size={16} className="text-ceda-copper" />
            <span>CEDA Toll-Free Helpdesk</span>
          </div>
          <p className="text-ceda-slate leading-relaxed">
            Call <span className="font-bold text-ceda-ink">0800 600 253</span> toll-free from any network in Botswana. Operating hours 08:00 to 17:00 CAT (Monday – Friday).
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-ceda-ink">
            <Mail size={16} className="text-ceda-copper" />
            <span>Emergency Operations Email</span>
          </div>
          <p className="text-ceda-slate leading-relaxed">
            Email <code className="font-mono text-ceda-ink font-semibold">ops@ceda.co.bw</code> for P1 critical outages after business hours.
          </p>
        </div>
      </div>
    </div>
  );
}
