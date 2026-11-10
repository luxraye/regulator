"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Users,
  FileEdit,
  ShieldCheck,
  FileCheck2,
  Filter,
  Scale,
  MessageSquare,
  Trophy,
  Award,
  Radio,
  FileText,
  Bell,
  History,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { InfoTip } from "@/components/ui/info-tip";
import { ForTechnicalJudges } from "@/components/ui/for-technical-judges";

const DEMO_PASSWORD = "CedaDemo2026!";

interface JourneyStep {
  step: number;
  title: string;
  stageName: string;
  role: string;
  roleEmail: string;
  targetHref: string;
  icon: React.ElementType;
  color: string;
  plainSummary: string;
  whatHappens: string[];
  proofPoint: string;
  technicalDetails: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    title: "Eligibility Check Passed",
    stageName: "Eligibility Verification",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/eligibility",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50 border-emerald-300",
    plainSummary: "The founder completes a 30-second quiz verifying Botswana citizen youth status (18–35 years) and company registration.",
    whatHappens: [
      "100% citizen shareholding rule confirmed via CIPA registry query.",
      "Primary founder confirmed under 35 years old via Omang validation.",
      "Green light issued with downloadable pre-qualification receipt.",
    ],
    proofPoint: "Pre-qualification receipt issued before sensitive corporate data is submitted.",
    technicalDetails: "Zero-knowledge eligibility AST evaluator validating age (<= 35) and citizenship (BW) constraints without persisting raw identity credentials.",
  },
  {
    step: 2,
    title: "Team Setup & Co-Founders",
    stageName: "Team Formation",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/register",
    icon: Users,
    color: "text-blue-600 bg-blue-50 border-blue-300",
    plainSummary: "The lead founder invites 2 citizen co-founders into their team dossier with defined equity and technical roles.",
    whatHappens: [
      "Team size limit enforced (1 to 5 members strictly per CEDA guidelines).",
      "All member Omang identity numbers cryptographically checked.",
      "Role-based co-editor permissions assigned for application drafting.",
    ],
    proofPoint: "Prevents duplicate team member registrations across competing proposals.",
    technicalDetails: "Unique relational constraint on team memberships indexed by Omang hash, preventing concurrent multi-team allocations.",
  },
  {
    step: 3,
    title: "Application Drafted (Autosave)",
    stageName: "Dossier Drafting",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/dashboard/innovator",
    icon: FileEdit,
    color: "text-purple-600 bg-purple-50 border-purple-300",
    plainSummary: "The team fills out their pitch deck, technical architecture, and milestone budget with automatic draft saving.",
    whatHappens: [
      "Real-time background saving ensures zero data loss during power outages.",
      "Smart character counters and section guidance for each required field.",
      "Collaborative editing indicators when team members are working.",
    ],
    proofPoint: "Unfinished applications are preserved safely in private draft state.",
    technicalDetails: "Debounced REST PATCH requests updating encrypted JSON blob with optimistic concurrency locks.",
  },
  {
    step: 4,
    title: "Submission Check (Pre-Flight)",
    stageName: "Safety Validation",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/dashboard/innovator",
    icon: ShieldCheck,
    color: "text-teal-600 bg-teal-50 border-teal-300",
    plainSummary: "Before submitting, an automated check tests pitch files for viruses, safe formatting, and clean links.",
    whatHappens: [
      "Magic-byte scanner verifies PDF authenticity and blocks executable code.",
      "Zip-Slip archive scanner prevents path traversal attacks.",
      "Credential scanner alerts team if an API key or password was left in the proposal.",
    ],
    proofPoint: "Instant amber alert allows team to fix an unformatted file before final submission.",
    technicalDetails: "Zero-trust client-side and server-side magic byte MIME sniffing (0x255044462d), ClamAV mock scanner, and entropy-based credential regex masking.",
  },
  {
    step: 5,
    title: "Submitted with Signed Receipt",
    stageName: "Final Submission",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/track",
    icon: FileCheck2,
    color: "text-amber-600 bg-amber-50 border-amber-300",
    plainSummary: "The team clicks submit. A digital receipt is generated with an exact timestamp and a private tracking code.",
    whatHappens: [
      "Proposal is locked so nobody—including CEDA staff—can alter contents.",
      "A permanent tracking reference code (e.g. CEDA-2026-X79K) is issued.",
      "Downloadable and printable verification receipt issued to the team.",
    ],
    proofPoint: "The receipt proves exactly what was submitted and at what exact second.",
    technicalDetails: "SHA-256 fingerprint generated over the canonical payload JSON and signed using HMAC-SHA256 timestamped token.",
  },
  {
    step: 6,
    title: "Screening Queue",
    stageName: "Intake Screening",
    role: "Programme Admin",
    roleEmail: "admin@demo.ceda.bw",
    targetHref: "/dashboard/admin",
    icon: Filter,
    color: "text-slate-700 bg-slate-100 border-slate-300",
    plainSummary: "CEDA programme administrators perform completeness screening and verify all required documentation.",
    whatHappens: [
      "All automated pre-flight checks are verified green.",
      "CIPA business registration certificate validated on national portal.",
      "Proposal approved to enter the blind expert evaluation round.",
    ],
    proofPoint: "Incomplete or fraudulent entries are flagged before reaching expert judges.",
    technicalDetails: "Batch screening state transition (SUBMITTED -> SCREENED) logged with admin actor id into the append-only audit ledger.",
  },
  {
    step: 7,
    title: "Blind Scoring by 2 Evaluators",
    stageName: "Expert Evaluation",
    role: "Evaluator",
    roleEmail: "evaluator@demo.ceda.bw",
    targetHref: "/dashboard/evaluator",
    icon: Scale,
    color: "text-indigo-600 bg-indigo-50 border-indigo-300",
    plainSummary: "Two independent experts score the proposal against a 100-point rubric without seeing applicant names.",
    whatHappens: [
      "Evaluator must sign a legally binding 'No Conflict of Interest' declaration.",
      "Founder identity, photos, and team names are strictly masked to ensure pure merit.",
      "Evaluators score 1–5 on weighted criteria with mandatory written feedback.",
    ],
    proofPoint: "Judged purely on technical merit and market viability, not on personal connections.",
    technicalDetails: "Double-blind evaluation model masking user.name and user.organizationName at the Prisma query level.",
  },
  {
    step: 8,
    title: "Disagreement Harmonization",
    stageName: "Consensus Panel",
    role: "Committee Panel",
    roleEmail: "panel@demo.ceda.bw",
    targetHref: "/dashboard/panel",
    icon: MessageSquare,
    color: "text-rose-600 bg-rose-50 border-rose-300",
    plainSummary: "When two evaluator marks differ by over 20 points, the committee convenes a consensus session to harmonize scores.",
    whatHappens: [
      "Automated variance detection flags divergent scores (e.g. 85 vs 62).",
      "Both evaluators review feedback and discuss technical discrepancies.",
      "Adjudicator panel establishes consensus score backed by recorded minutes.",
    ],
    proofPoint: "No single judge can unfairly sink or artificially inflate a proposal.",
    technicalDetails: "Variance delta calculation `Math.abs(eval1.total - eval2.total) >= instance.rubric.disagreementThreshold` triggering required committee review.",
  },
  {
    step: 9,
    title: "Shortlisted on Fair Ranking",
    stageName: "Public Leaderboard",
    role: "Evaluator",
    roleEmail: "evaluator@demo.ceda.bw",
    targetHref: "/instances/ceda-hackathon-2026",
    icon: Trophy,
    color: "text-amber-500 bg-amber-50 border-amber-300",
    plainSummary: "The proposal appears on the publicly checkable leaderboard ranked purely on validated scores.",
    whatHappens: [
      "Weighted criteria marks compiled into mathematical score.",
      "The leaderboard displays a reproducible cryptographic fingerprint.",
      "Top 10 finalists officially shortlisted for the live demonstration round.",
    ],
    proofPoint: "Anyone can verify the rankings match the underlying evaluator scorecards.",
    technicalDetails: "Deterministic ranking computation with canonical JSON hashing proving mathematical scorecard integrity.",
  },
  {
    step: 10,
    title: "Clarification Q&A Session",
    stageName: "Due Diligence",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/dashboard/innovator",
    icon: FileText,
    color: "text-cyan-600 bg-cyan-50 border-cyan-300",
    plainSummary: "The committee requests technical clarification regarding rural cold-chain deployment, and the team replies.",
    whatHappens: [
      "In-platform secure messaging prevents offline back-channel communication.",
      "Team provides supplementary telemetry and component supplier letters.",
      "Full exchange archived permanently into the proposal dossier.",
    ],
    proofPoint: "All applicant communications are auditable and time-stamped.",
    technicalDetails: "Encrypted in-app message thread linked to EntryId with immutable audit logs.",
  },
  {
    step: 11,
    title: "Live Pitch & Public Vote",
    stageName: "Demonstration & Voting",
    role: "Committee Panel",
    roleEmail: "panel@demo.ceda.bw",
    targetHref: "/instances/ceda-hackathon-2026",
    icon: Radio,
    color: "text-orange-600 bg-orange-50 border-orange-300",
    plainSummary: "Finalists pitch live to the adjudicator panel, accompanied by verified public voting via web and USSD.",
    whatHappens: [
      "10-minute live demonstration of working IoT prototype.",
      "Adjudicators submit final calibrated presentation scores.",
      "Public vote weight (20%) factored in with anti-bot rate limiting.",
    ],
    proofPoint: "Transparent combination of expert adjudication and citizen community support.",
    technicalDetails: "Weighted score formulation `(adjudicatorScore * 0.8) + (publicNormalizedScore * 0.2)` with device fingerprint anti-sybil checks.",
  },
  {
    step: 12,
    title: "Board Award Decision",
    stageName: "Grant Disbursement",
    role: "Committee Panel",
    roleEmail: "panel@demo.ceda.bw",
    targetHref: "/dashboard/panel",
    icon: Award,
    color: "text-emerald-700 bg-emerald-50 border-emerald-400",
    plainSummary: "The CEDA innovation committee signs off on the P150,000 equity-free grant and incubation contract.",
    whatHappens: [
      "Quorum sign-off by committee chair and financial controller.",
      "Milestone disbursement tranches established (30% upfront, 70% upon KPIs).",
      "Official award notification dispatched to the founders.",
    ],
    proofPoint: "Formal board approval backed by digital multi-signature.",
    technicalDetails: "Quorum validation requirement and status change to `AWARDED` with linked funding contract record.",
  },
  {
    step: 13,
    title: "Signed Certificate Issued",
    stageName: "Credential Verification",
    role: "Public Visitor",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/verify",
    icon: Shield,
    color: "text-amber-600 bg-amber-50 border-amber-300",
    plainSummary: "An official digital award certificate is generated with a QR code verifiable on CEDA's public checker.",
    whatHappens: [
      "Certificate includes QR code linking to `/verify?ref=...`.",
      "Any bank, investor, or partner can verify certificate validity in 2 seconds.",
      "Tamper-proof against fake or forged award claims.",
    ],
    proofPoint: "Digital proof of grant award recognized by commercial Botswana lenders.",
    technicalDetails: "ECDSA cryptographic signature payload embeddable as SVG / PDF with public key verification endpoint.",
  },
  {
    step: 14,
    title: "Showcased in Funded Innovators",
    stageName: "Public Portfolio",
    role: "Public Visitor",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/funded",
    icon: Sparkles,
    color: "text-purple-700 bg-purple-50 border-purple-300",
    plainSummary: "The startup appears in the national innovation showcase with impact metrics, video, and team profiles.",
    whatHappens: [
      "Published in CEDA's public portfolio of funded citizen businesses.",
      "Tracks real-world job creation, patent filings, and market traction.",
      "Enables prospective partners and corporate clients to discover the company.",
    ],
    proofPoint: "Public accountability showing how citizen tax revenues create tangible economic value.",
    technicalDetails: "Server-side rendered portfolio page with dynamic category filtering and SEO metadata.",
  },
  {
    step: 15,
    title: "Multi-Channel Alert Subscriptions",
    stageName: "Notification Delivery",
    role: "Innovator",
    roleEmail: "innovator@demo.ceda.bw",
    targetHref: "/demo-inbox",
    icon: Bell,
    color: "text-blue-700 bg-blue-50 border-blue-300",
    plainSummary: "Throughout the 16 steps, the team received real-time SMS and email alerts without needing internet data.",
    whatHappens: [
      "SMS alerts dispatched at every milestone (screening, shortlisting, award).",
      "Offline founders dialled *161# to check real-time status from rural cattleposts.",
      "Zero missed deadlines due to lack of mobile data bundles.",
    ],
    proofPoint: "Equitable access for rural innovators across all 16 Botswana districts.",
    technicalDetails: "Multi-channel event bus dispatching to mock SMS gateway, USSD state session, and scoped demo inbox.",
  },
  {
    step: 16,
    title: "Tamper-Proof Activity Record",
    stageName: "Permanent Audit Trail",
    role: "Superadmin",
    roleEmail: "super@demo.ceda.bw",
    targetHref: "/dashboard/superadmin",
    icon: History,
    color: "text-slate-900 bg-slate-100 border-slate-400",
    plainSummary: "Every action, score, and decision is sealed into a permanent activity record that cannot be edited or erased.",
    whatHappens: [
      "Hash-chained log verifies every action has an immutable parent hash.",
      "Auditors can verify that zero records were deleted, inserted, or modified.",
      "Complete closed-loop mathematical proof from Step 1 to Step 16.",
    ],
    proofPoint: "Full institutional transparency meeting the highest international governance standards.",
    technicalDetails: "Cryptographic hash-chaining `SHA256(previousHash + eventType + payload + timestamp)` verified with tamper-detection assertions.",
  },
];

export default function LivingIdeaLifecyclePage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const router = useRouter();
  const timelineRef = useRef<HTMLDivElement>(null);

  const current = JOURNEY_STEPS.find((s) => s.step === activeStep) ?? JOURNEY_STEPS[0];

  // Auto-play timeline progression (~5 seconds per stage)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % JOURNEY_STEPS.length) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Scroll active stage card into view when changed
  useEffect(() => {
    const el = document.getElementById(`step-card-${activeStep}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeStep]);

  // 1-Click "Open this screen" handler
  async function handleOpenScreen(step: JourneyStep) {
    setLoggingIn(true);
    try {
      // Authenticate as the required role and navigate to target screen
      const res = await signIn("credentials", {
        email: step.roleEmail,
        password: DEMO_PASSWORD,
        redirect: false,
        callbackUrl: step.targetHref,
      });

      if (res?.ok || res?.url) {
        router.push(step.targetHref);
      } else {
        // Fallback direct navigate if already logged in or error
        router.push(step.targetHref);
      }
    } catch {
      router.push(step.targetHref);
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-ceda-slate">
        <Link href="/" className="hover:text-ceda-ink transition">
          ← Back to Home
        </Link>
        <span>•</span>
        <span className="font-semibold text-ceda-copper">Living Idea Lifecycle</span>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
            End-to-End Walkthrough
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            16-Step Closed Loop
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ceda-ink sm:text-4xl">
            The Living Idea Lifecycle: Follow an Idea&apos;s Complete Journey
          </h1>
          <p className="mt-2 text-sm text-ceda-slate sm:text-base leading-relaxed max-w-3xl">
            Watch one citizen innovation travel from a 30-second eligibility check all the way to an awarded P150,000 grant, a verified digital certificate, and a tamper-proof activity record.
          </p>
        </div>

        <DemoDataBanner message="Demo data: illustrated sample journey following EcoKgalagadi Cold-Chain IoT (Pty) Ltd" />

        {/* Playback Controls & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm",
                isPlaying
                  ? "bg-amber-500 text-ceda-ink hover:bg-amber-400"
                  : "bg-ceda-orange text-white hover:bg-ceda-copper"
              )}
            >
              {isPlaying ? <Pause size={14} className="fill-ceda-ink" /> : <Play size={14} className="fill-white" />}
              <span>{isPlaying ? "Pause Autoplay" : "Autoplay Closed Loop"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-100 transition"
              title="Reset to Step 1"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Step Selector & Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep((s) => Math.max(1, s - 1));
              }}
              className="rounded-lg border border-border bg-white p-2 text-ceda-ink disabled:opacity-30 hover:bg-slate-100 transition"
              aria-label="Previous step"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-ceda-ink">
              Stage <span className="text-ceda-orange text-sm">{activeStep}</span> of {JOURNEY_STEPS.length}
            </span>

            <button
              type="button"
              disabled={activeStep === JOURNEY_STEPS.length}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep((s) => Math.min(JOURNEY_STEPS.length, s + 1));
              }}
              className="rounded-lg border border-border bg-white p-2 text-ceda-ink disabled:opacity-30 hover:bg-slate-100 transition"
              aria-label="Next step"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll-Driven Step Navigator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-ceda-slate px-1">
          <span>Timeline Stages (Click any step to inspect):</span>
          <span>Scroll horizontally →</span>
        </div>

        <div
          ref={timelineRef}
          className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-ceda-copper/20"
        >
          {JOURNEY_STEPS.map((s) => {
            const isCurrent = s.step === activeStep;
            const isPast = s.step < activeStep;
            const StepIcon = s.icon;

            return (
              <button
                key={s.step}
                id={`step-card-${s.step}`}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(s.step);
                }}
                className={cn(
                  "flex-shrink-0 w-44 rounded-2xl border p-3.5 text-left transition-all relative",
                  isCurrent
                    ? "border-ceda-orange bg-orange-50/70 shadow-md ring-2 ring-ceda-orange/30 scale-105"
                    : isPast
                    ? "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50"
                    : "border-border bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold",
                      isCurrent
                        ? "bg-ceda-orange text-white"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-ceda-slate"
                    )}
                  >
                    {s.step}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StepIcon size={12} className={isCurrent ? "text-ceda-orange" : "text-ceda-copper"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ceda-copper">
                      {s.stageName}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 font-bold text-xs text-ceda-ink line-clamp-1">
                  {s.title}
                </div>
                <div className="mt-1 text-[10px] text-ceda-slate line-clamp-2">
                  {s.plainSummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Deep-Dive Card */}
      <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-start gap-4">
            <div className={cn("rounded-2xl p-3 border", current.color)}>
              <current.icon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-ceda-sand px-2.5 py-0.5 text-xs font-bold text-ceda-copper">
                  Step {current.step} of 16
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-ceda-slate">
                  Role: <strong className="text-ceda-ink">{current.role}</strong>
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-ceda-ink sm:text-3xl">
                {current.title}
              </h2>
              <p className="mt-1 text-sm text-ceda-slate">
                {current.plainSummary}
              </p>
            </div>
          </div>

          {/* The "Open this screen" 1-Click Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              disabled={loggingIn}
              onClick={() => handleOpenScreen(current)}
              className="inline-flex items-center gap-2 rounded-xl bg-ceda-orange px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-ceda-copper transition disabled:opacity-50"
            >
              {loggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In as {current.role}...</span>
                </>
              ) : (
                <>
                  <span>Open This Real Screen</span>
                  <ExternalLink size={16} />
                </>
              )}
            </button>

            <InfoTip
              plain={current.proofPoint}
              technical={current.technicalDetails}
              learnMoreUrl={current.targetHref}
              learnMoreLabel={`Visit ${current.stageName}`}
            />
          </div>
        </div>

        {/* 3 Key Actions Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ceda-copper">
            What Happens at this Stage
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.whatHappens.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-slate-50/70 p-3.5 text-xs text-ceda-ink"
              >
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Fairness & Governance Callout */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Fairness &amp; Governance Proof: </span>
            <span className="text-emerald-900 leading-relaxed">{current.proofPoint}</span>
          </div>
        </div>

        {/* Collapsible Technical Details for Judges */}
        <ForTechnicalJudges title="For technical judges: Underlying Architecture & Verification">
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-border">
              {current.technicalDetails}
            </p>
            <div className="flex items-center justify-between text-[11px] text-ceda-slate pt-1">
              <span>Simulated Persona: <code>{current.roleEmail}</code></span>
              <span>Target Route: <code>{current.targetHref}</code></span>
            </div>
          </div>
        </ForTechnicalJudges>
      </div>

      {/* Bottom Cross-Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div>
          <h4 className="font-bold text-sm text-ceda-ink">Ready to explore the real system?</h4>
          <p className="text-xs text-ceda-slate mt-0.5">
            Take the 3-minute guided tour or explore all open competitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/judges"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-xs font-bold text-ceda-ink hover:bg-slate-100 transition"
          >
            <span>Take Judges&apos; Tour</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/instances"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-ceda-copper transition"
          >
            <span>Explore All Competitions</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
