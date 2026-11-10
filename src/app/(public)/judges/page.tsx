"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Award,
  Terminal,
  FileCheck,
  Building2,
  Headset,
  Eye,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { InfoTip } from "@/components/ui/info-tip";
import { ForTechnicalJudges } from "@/components/ui/for-technical-judges";

const DEMO_PASSWORD = "CedaDemo2026!";

interface TourStep {
  minute: string;
  title: string;
  tagline: string;
  icon: any;
  whatToLookFor: string[];
  technicalDetails?: string[];
  suggestedAction: {
    label: string;
    href: string;
  };
  recommendedRole: {
    role: string;
    email: string;
    description: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    minute: "Minute 1",
    title: "Multi-Tenant Architecture & Dynamic Branding",
    tagline: "Explore true multi-tenant workspace isolation across CEDA, BDIH, and BTC Innovation.",
    icon: Building2,
    whatToLookFor: [
      "Every Partner gets their own branded space with authentic corporate identity, primary/secondary palettes, and SVG logos.",
      "Strict data isolation: Partner Admins only manage their own Instances, evaluators, API keys, and audit logs.",
      "Public partner directories (/partners/bdih, /partners/btc) showcasing published challenges with custom theme injection.",
    ],
    technicalDetails: [
      "Tenant separation enforced via PostgreSQL foreign key relations on Partner.id.",
      "Theme tokens dynamically injected at runtime via CSS custom properties on server component render.",
      "Partner-scoped API key issuance with SHA-256 token hashing and bearer authentication middleware.",
    ],
    suggestedAction: {
      label: "View BDIH Partner Space →",
      href: "/partners/bdih",
    },
    recommendedRole: {
      role: "Partner Admin (BDIH)",
      email: "bdih.admin@demo.ceda.bw",
      description: "Logs directly into the BDIH Partner Workspace (/dashboard/partner/settings).",
    },
  },
  {
    minute: "Minute 2",
    title: "Competition Studio & Rules Seal",
    tagline: "Inspect the Studio Builder and cryptographic definition fingerprinting.",
    icon: Layers,
    whatToLookFor: [
      "Every competition is defined as an executable specification (metadata, stages, rubric weights, eligibility rules).",
      "Deep key-order invariant canonicalization generates a tamper-evident SHA-256 rules seal.",
      "The Studio compiles specifications into active stages, applicant intake forms, and security pre-flight gates.",
    ],
    technicalDetails: [
      "Specification canonicalization uses recursive key sorting in UTF-8 byte order (RFC 8785).",
      "RulesHash: SHA-256 hex digest over canonical JSON, sealed upon publishing.",
      "Validator checks 100% rubric sum, chronological stage ordering, and team size boundaries.",
    ],
    suggestedAction: {
      label: "Open Instance Studio →",
      href: "/dashboard/instances",
    },
    recommendedRole: {
      role: "Programme Admin",
      email: "admin@demo.ceda.bw",
      description: "Full access to create, simulate, and publish challenge blueprints.",
    },
  },
  {
    minute: "Minute 3",
    title: "Submission Safety Checks & Sealed Reports",
    tagline: "Experience client & server-side zero-trust submission validation before files touch the database.",
    icon: ShieldCheck,
    whatToLookFor: [
      "MIME sniffing detects and blocks executable files masquerading as PDFs.",
      "Archive file checks prevent path traversal attacks and decompression bombs.",
      "Integrated malware signature and credential scanner masks exposed keys in sealed pre-flight reports.",
    ],
    technicalDetails: [
      "Zero-trust file inspection checks magic bytes (e.g., %PDF vs MZ DOS header).",
      "Archive extraction validates canonical normalized relative paths to prevent directory traversal.",
      "Pre-flight results generate a deterministic JSON report with sha256 checksums.",
    ],
    suggestedAction: {
      label: "Read Infrastructure & Security Status →",
      href: "/status",
    },
    recommendedRole: {
      role: "Innovator",
      email: "innovator@demo.ceda.bw",
      description: "Submit ideas and observe automated real-time pre-flight verification.",
    },
  },
  {
    minute: "Minute 4",
    title: "Fair Ranking Anyone Can Re-Check",
    tagline: "100-point rubric rankings with blind peer reviews and agreed consensus.",
    icon: Award,
    whatToLookFor: [
      "Blind scoring: applicant personal identifiers and Omang numbers are cryptographically concealed from evaluators.",
      "Collaborative consensus: once individual blind scores are logged, evaluators discuss in-thread and commit agreed consensus notes.",
      "Fair ranking: tie-breaking breaks down by criteria weights and generates a public verification fingerprint.",
    ],
    technicalDetails: [
      "Blinded review removes User.omang and User.name before serializing scorecard to reviewer.",
      "Leaderboard calculation computes criterion-weighted means with deterministic tie-breaking.",
      "Disagreement threshold: flags entries where max(scores) - min(scores) >= 20 pts.",
    ],
    suggestedAction: {
      label: "Explore Flagship Challenge Leaderboard →",
      href: "/instances/ceda-hackathon-2026",
    },
    recommendedRole: {
      role: "Evaluator",
      email: "evaluator@demo.ceda.bw",
      description: "Grade assigned ventures using the official 100-point rubric.",
    },
  },
  {
    minute: "Minute 5",
    title: "Statutory Governance, Live Chat & Scoped Communications",
    tagline: "Audit trails, 15s committee telemetry, consultant live chat, and judge demo inbox.",
    icon: Compass,
    whatToLookFor: [
      "Cryptographic audit log verification (/api/audit/verify) ensures historical logs cannot be secretly altered or backdated.",
      "Committee Observer Console (/dashboard/observer) provides read-only statutory oversight with 15-second polling.",
      "Live CEDA Consultant chat respects Botswana working hours (09:00-16:00 CAT) and national holidays.",
      "Judge Demo Inbox (/demo-inbox) captures OTP passcodes and reset links safely scoped to your browser session.",
    ],
    technicalDetails: [
      "Audit logs record action, actorId, timestamp, and optional cryptographic payload hash.",
      "Observer console queries live telemetry with 15-second polling interval.",
      "Session-scoped demo inbox stores ephemeral OTPs in session memory with automatic purge.",
    ],
    suggestedAction: {
      label: "Open Committee Observer Console →",
      href: "/dashboard/observer",
    },
    recommendedRole: {
      role: "Committee Observer",
      email: "observer@demo.ceda.bw",
      description: "Read-only statutory audit role with real-time progression telemetry.",
    },
  },
];

const QUICK_ROLES = [
  { role: "Super Admin", email: "super@demo.ceda.bw", badge: "Governance & Audit", icon: ShieldAlert },
  { role: "Programme Admin", email: "admin@demo.ceda.bw", badge: "Studio & Screening", icon: Layers },
  { role: "Evaluator", email: "evaluator@demo.ceda.bw", badge: "100-pt Scoring", icon: Award },
  { role: "Adjudicator", email: "panel@demo.ceda.bw", badge: "Panel Shortlist", icon: FileCheck },
  { role: "Innovator", email: "innovator@demo.ceda.bw", badge: "Submissions & Certificate", icon: Sparkles },
  { role: "Partner Admin (BDIH)", email: "bdih.admin@demo.ceda.bw", badge: "GovTech Space", icon: Building2 },
  { role: "Partner Admin (BTC)", email: "btc.admin@demo.ceda.bw", badge: "5G Challenge Space", icon: Terminal },
  { role: "Consultant", email: "consultant@demo.ceda.bw", badge: "Live Chat & Advisory", icon: Headset },
  { role: "Committee Observer", email: "observer@demo.ceda.bw", badge: "15s Statutory Telemetry", icon: Eye },
];

export default function JudgesTourPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  const handleQuickLogin = async (email: string) => {
    setLoggingIn(email);
    const res = await signIn("credentials", {
      email,
      password: DEMO_PASSWORD,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoggingIn(null);
      alert("Sign-in failed. Please verify credentials.");
    }
  };

  const current = TOUR_STEPS[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-3 border-b border-border pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ceda-copper/10 text-ceda-copper">
          <Compass size={14} />
          <span>Official Evaluation Guide</span>
          <InfoTip
            plain="Step-by-step walkthrough demonstrating each core feature with 1-click persona logins."
            technical="Structured evaluation sequence for technical judges across multi-tenancy, canonical hashing, security, rubric scoring, and audit trails."
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-ceda-ink tracking-tight">
          5-Minute Guided Tour for Judges
        </h1>
        <p className="text-sm md:text-base text-ceda-slate max-w-2xl mx-auto leading-relaxed">
          Welcome, Judges. Follow this sequential 5-minute walkthrough to test every programmable capability,
          cryptographic security guard, multi-tenant partner space, and statutory governance mechanism.
        </p>

        {/* Global Demo Password Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-ceda-sand border border-border text-xs font-medium text-ceda-ink">
            <span>Universal Demo Password:</span>
            <code className="px-2 py-0.5 rounded bg-white font-mono font-bold text-ceda-copper border">
              {DEMO_PASSWORD}
            </code>
            <span className="text-ceda-slate">(Click any role below for instant one-click sign in)</span>
          </div>
          <DemoDataBanner message="Demo data: fictional teams for illustration" />
        </div>
      </div>

      {/* 5-Step Timeline Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {TOUR_STEPS.map((step, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={step.minute}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-xl border text-left transition shadow-sm ${
                isActive
                  ? "bg-ceda-ink text-white border-ceda-ink ring-2 ring-ceda-orange"
                  : "bg-white border-border hover:bg-neutral-50 text-ceda-ink"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-wider block ${isActive ? "text-ceda-amber" : "text-ceda-copper"}`}>
                {step.minute}
              </span>
              <p className="text-xs font-bold line-clamp-1 mt-0.5">{step.title}</p>
            </button>
          );
        })}
      </div>

      {/* Active Step Feature Showcase Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-border bg-white shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-ceda-orange/10 text-ceda-orange shrink-0">
              <StepIcon size={32} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-ceda-copper">
                {current.minute} of 5
              </span>
              <h2 className="text-2xl font-black text-ceda-ink mt-0.5">{current.title}</h2>
              <p className="text-sm text-ceda-slate mt-1">{current.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={current.suggestedAction.href}
              className="px-4 py-2 rounded-xl bg-ceda-orange hover:bg-ceda-copper text-white font-bold text-xs shadow transition shrink-0"
            >
              {current.suggestedAction.label}
            </Link>
          </div>
        </div>

        {/* What to Inspect Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-ceda-slate">Key Features to Evaluate:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {current.whatToLookFor.map((item, i) => (
              <li
                key={i}
                className="p-4 rounded-xl border border-border bg-neutral-50/70 text-xs text-ceda-ink leading-relaxed space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 size={14} /> Feature Check {i + 1}
                </div>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* For technical judges: architecture & specifications */}
        {current.technicalDetails && current.technicalDetails.length > 0 && (
          <ForTechnicalJudges title={`For technical judges: ${current.minute} technical details`}>
            <ul className="space-y-1.5 text-xs text-slate-800 font-mono">
              {current.technicalDetails.map((td, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-ceda-copper font-bold">•</span>
                  <span>{td}</span>
                </li>
              ))}
            </ul>
          </ForTechnicalJudges>
        )}

        {/* Recommended Testing Role */}
        <div className="p-4 rounded-xl bg-ceda-sand/70 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-ceda-copper">Recommended Persona for this Step:</span>
            <p className="text-sm font-black text-ceda-ink">
              {current.recommendedRole.role} ({current.recommendedRole.email})
            </p>
            <p className="text-xs text-ceda-slate mt-0.5">{current.recommendedRole.description}</p>
          </div>

          <button
            onClick={() => handleQuickLogin(current.recommendedRole.email)}
            disabled={loggingIn === current.recommendedRole.email}
            className="px-4 py-2 rounded-xl bg-ceda-ink hover:bg-neutral-800 text-white font-bold text-xs transition shadow-sm inline-flex items-center gap-1.5 shrink-0 disabled:opacity-60"
          >
            {loggingIn === current.recommendedRole.email ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} />
            )}
            <span>Sign In as {current.recommendedRole.role}</span>
          </button>
        </div>

        {/* Step Carousel Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-ceda-slate hover:text-ceda-ink hover:bg-neutral-50 disabled:opacity-30"
          >
            ← Previous Minute
          </button>

          <span className="text-xs text-ceda-slate font-mono">
            Step {activeStep + 1} of {TOUR_STEPS.length}
          </span>

          <button
            onClick={() => setActiveStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
            disabled={activeStep === TOUR_STEPS.length - 1}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-ceda-slate hover:text-ceda-ink hover:bg-neutral-50 disabled:opacity-30"
          >
            Next Minute →
          </button>
        </div>
      </div>

      {/* Quick Role Switcher Grid */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-ceda-copper">One-Click Testing Accounts</span>
          <h2 className="text-xl font-black text-ceda-ink">Instant Role-Switching Hub</h2>
          <p className="text-xs text-ceda-slate">Click any account below to sign in instantly with session authorization:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_ROLES.map((r) => {
            const Icon = r.icon;
            const isLoggingIn = loggingIn === r.email;
            return (
              <button
                key={r.email}
                onClick={() => handleQuickLogin(r.email)}
                disabled={!!loggingIn}
                className="p-4 rounded-xl border border-border bg-white hover:border-ceda-orange hover:shadow-md transition text-left space-y-2 group disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-ceda-sand text-ceda-ink group-hover:bg-ceda-orange group-hover:text-white transition">
                    {isLoggingIn ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                    {r.badge}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-ceda-ink group-hover:text-ceda-orange transition">{r.role}</p>
                  <p className="text-xs text-ceda-slate font-mono truncate">{r.email}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Tooling & Endpoints Matrix */}
      <div className="p-6 rounded-2xl border border-border bg-ceda-sand/50 space-y-4">
        <div>
          <h3 className="text-sm font-black text-ceda-ink uppercase tracking-wider">
            Verification Tooling & Deep-Link Directory
          </h3>
          <p className="text-xs text-ceda-slate">Inspect key compliance, security, and integration endpoints:</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Link
            href="/demo-inbox"
            target="_blank"
            className="p-3 rounded-xl border border-border bg-white hover:border-ceda-copper shadow-sm space-y-1 block"
          >
            <span className="font-bold text-ceda-ink flex items-center justify-between">
              /demo-inbox <ExternalLink size={12} />
            </span>
            <span className="text-[11px] text-ceda-slate block">Scoped OTP passcodes & emails</span>
          </Link>

          <Link
            href="/status"
            target="_blank"
            className="p-3 rounded-xl border border-border bg-white hover:border-ceda-copper shadow-sm space-y-1 block"
          >
            <span className="font-bold text-ceda-ink flex items-center justify-between">
              /status <ExternalLink size={12} />
            </span>
            <span className="text-[11px] text-ceda-slate block">Telemetry & P734/mo economics</span>
          </Link>

          <Link
            href="/api/audit/verify"
            target="_blank"
            className="p-3 rounded-xl border border-border bg-white hover:border-ceda-copper shadow-sm space-y-1 block"
          >
            <span className="font-bold text-ceda-ink flex items-center justify-between">
              /api/audit/verify <ExternalLink size={12} />
            </span>
            <span className="text-[11px] text-ceda-slate block">Audit SHA-256 hash chaining</span>
          </Link>

          <Link
            href="/api/v1/docs"
            target="_blank"
            className="p-3 rounded-xl border border-border bg-white hover:border-ceda-copper shadow-sm space-y-1 block"
          >
            <span className="font-bold text-ceda-ink flex items-center justify-between">
              /api/v1/docs <ExternalLink size={12} />
            </span>
            <span className="text-[11px] text-ceda-slate block">OpenAPI spec & partner webhooks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
