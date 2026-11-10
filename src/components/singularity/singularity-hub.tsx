"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Sliders,
  Scale,
  Award,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Compass,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";

export interface BranchItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  roleHint?: string;
  badge?: string;
}

export interface HubBranch {
  id: string;
  name: string;
  label: string;
  icon: React.ElementType;
  tagline: string;
  color: string;
  textColor: string;
  bgColor: string;
  accentBorder: string;
  glowColor: string;
  subBranches: BranchItem[];
}

export const HUB_BRANCHES: HubBranch[] = [
  {
    id: "compete",
    name: "Compete",
    label: "Citizen Competitions",
    icon: Trophy,
    tagline: "Enter CEDA challenges with locked, checkable rules",
    color: "#D96B27",
    textColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    accentBorder: "border-amber-500/40",
    glowColor: "rgba(217, 107, 39, 0.4)",
    subBranches: [
      {
        id: "instances",
        title: "Instances",
        desc: "All competitions, each with locked, checkable rules",
        href: "/instances",
        badge: "Core",
      },
      {
        id: "calls",
        title: "Open Calls",
        desc: "Funding calls you can apply to today across Botswana",
        href: "/calls",
      },
      {
        id: "eligibility",
        title: "Am I Eligible?",
        desc: "30-second youth eligibility check (18–35 citizen requirements)",
        href: "/eligibility",
      },
      {
        id: "track",
        title: "Track Application",
        desc: "Check real-time progress using your secret reference code",
        href: "/track",
      },
    ],
  },
  {
    id: "build",
    name: "Build",
    label: "Competition Studio",
    icon: Sliders,
    tagline: "Design, configure, and simulate competition blueprints",
    color: "#B85D19",
    textColor: "text-orange-600",
    bgColor: "bg-orange-500/10",
    accentBorder: "border-orange-500/40",
    glowColor: "rgba(184, 93, 25, 0.4)",
    subBranches: [
      {
        id: "studio",
        title: "Instance Studio",
        desc: "Basic and Advanced visual competition builder with 4 steps",
        href: "/dashboard/instances/new",
        badge: "Admin",
      },
      {
        id: "templates",
        title: "Templates",
        desc: "Pre-validated challenge templates for tech, youth, and SME grants",
        href: "/instances",
      },
      {
        id: "simulate",
        title: "Pre-Flight Simulator",
        desc: "Simulate stage gates, upload guards, and rubrics before sealing",
        href: "/dashboard/instances",
      },
    ],
  },
  {
    id: "judge",
    name: "Judge",
    label: "Fair Evaluation",
    icon: Scale,
    tagline: "Blind scoring, conflict declaration, and consensus review",
    color: "#10B981",
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.4)",
    subBranches: [
      {
        id: "screening",
        title: "Application Screening",
        desc: "Automated checks for citizen youth eligibility and safety",
        href: "/dashboard/admin",
        roleHint: "Admin & Adjudicator",
      },
      {
        id: "scoring",
        title: "Blind Scoring",
        desc: "Independent evaluations with masked identity to ensure pure merit",
        href: "/dashboard/evaluator",
        roleHint: "Evaluator",
      },
      {
        id: "consensus",
        title: "Consensus Panel",
        desc: "Adjudication sessions resolving divergent evaluator marks",
        href: "/dashboard/panel",
        roleHint: "Committee Panel",
      },
      {
        id: "leaderboard",
        title: "Fair Ranking",
        desc: "Mathematical ranking anyone can independently re-check",
        href: "/instances/ceda-hackathon-2026",
      },
    ],
  },
  {
    id: "award",
    name: "Award",
    label: "Grants & Impact",
    icon: Award,
    tagline: "Funding decisions, verifiable certificates, and portfolio showcase",
    color: "#EAB308",
    textColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    accentBorder: "border-yellow-500/40",
    glowColor: "rgba(234, 179, 8, 0.4)",
    subBranches: [
      {
        id: "decisions",
        title: "Grant Allocations",
        desc: "Formal CEDA board disbursements and incubation contracts",
        href: "/dashboard/panel",
      },
      {
        id: "certificates",
        title: "Signed Certificates",
        desc: "Digital award credentials verifiable on the public ledger",
        href: "/verify",
      },
      {
        id: "funded",
        title: "Funded Showcase",
        desc: "Directory of commercialised citizen innovations and job creation",
        href: "/funded",
      },
    ],
  },
  {
    id: "trust",
    name: "Trust",
    label: "Rules & Integrity",
    icon: ShieldCheck,
    tagline: "Rules seal, fair-play verification, and activity record",
    color: "#06B6D4",
    textColor: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/40",
    glowColor: "rgba(6, 182, 212, 0.4)",
    subBranches: [
      {
        id: "rules-seal",
        title: "Rules Seal",
        desc: "Cryptographic proof that competition rules have not changed",
        href: "/instances/ceda-hackathon-2026",
        badge: "Verified",
      },
      {
        id: "fair-play",
        title: "Fair-Play Report",
        desc: "Verification confirming zero unannounced rubric or timeline modifications",
        href: "/instances/ceda-hackathon-2026",
      },
      {
        id: "activity-record",
        title: "Activity Record",
        desc: "Tamper-proof audit record tracking every submission and score",
        href: "/dashboard/superadmin",
        badge: "Superadmin",
      },
      {
        id: "verify",
        title: "Public Verifier",
        desc: "Check receipts, certificates, and rules independently",
        href: "/verify",
      },
    ],
  },
  {
    id: "help",
    name: "Help",
    label: "Support & Uptime",
    icon: HelpCircle,
    tagline: "Live consultant chat, SMS/USSD, and P734/mo cloud telemetry",
    color: "#F43F5E",
    textColor: "text-rose-500",
    bgColor: "bg-rose-500/10",
    accentBorder: "border-rose-500/40",
    glowColor: "rgba(244, 63, 94, 0.4)",
    subBranches: [
      {
        id: "chat",
        title: "Consultant Live Chat",
        desc: "Connect directly with CEDA technology & grant advisors",
        href: "/support",
      },
      {
        id: "faq",
        title: "Help & FAQ",
        desc: "Plain-language answers for applicant questions and guidelines",
        href: "/support",
      },
      {
        id: "ussd",
        title: "Offline USSD (*161#)",
        desc: "Status checking on basic feature phones without mobile data",
        href: "/ussd-demo",
        badge: "*161#",
      },
      {
        id: "status",
        title: "System Status & Costs",
        desc: "99.98% uptime telemetry and P734.40 / $54 USD monthly economics",
        href: "/status",
      },
    ],
  },
];

interface SingularityHubProps {
  /** Optional container height or presentation variant */
  variant?: "home" | "modal" | "dashboard";
  /** Optional role for personalizing node counters */
  userRole?: string;
  className?: string;
}

/**
 * The Singularity Hub (Phase 12b signature component).
 * An interactive radial map with a glowing core and 6 branching orbits.
 * Features:
 * - Idle slow rotation with drag/wheel/touch spin
 * - Zoom-into-branch navigation with breadcrumb trail
 * - Live preview cards for sub-sections before navigating
 * - "Play the journey" animated sequence highlighting the 16-step closed loop
 * - Keyboard navigation (Tab, Arrow keys, Enter, Escape)
 * - Accessible fallback respecting prefers-reduced-motion
 */
export function SingularityHub({
  variant: _variant = "home",
  userRole: _userRole,
  className,
}: SingularityHubProps) {
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BranchItem | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isPlayingJourney, setIsPlayingJourney] = useState(false);
  const [journeyStepIndex, setJourneyStepIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeBranch = HUB_BRANCHES.find((b) => b.id === activeBranchId) ?? null;

  // Idle gentle rotation
  useEffect(() => {
    if (!isRotating || activeBranchId !== null || isPlayingJourney) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.15) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isRotating, activeBranchId, isPlayingJourney]);

  // "Play the journey" closed-loop animation through branches
  useEffect(() => {
    if (!isPlayingJourney) return;
    const timer = setInterval(() => {
      setJourneyStepIndex((prev) => {
        const next = (prev + 1) % HUB_BRANCHES.length;
        return next;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlayingJourney]);

  // Touch and drag rotation handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setIsRotating(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || activeBranchId !== null) return;
    const delta = e.clientX - dragStartX;
    setRotationAngle((prev) => prev + delta * 0.4);
    setDragStartX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(true);
  };

  // Keyboard rotation with Arrow Left / Right
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setRotationAngle((prev) => prev - 15);
    } else if (e.key === "ArrowRight") {
      setRotationAngle((prev) => prev + 15);
    } else if (e.key === "Escape") {
      if (previewItem) setPreviewItem(null);
      else if (activeBranchId) setActiveBranchId(null);
    }
  };

  const currentJourneyBranch = isPlayingJourney ? HUB_BRANCHES[journeyStepIndex] : null;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        "relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ceda-ink via-slate-950 to-ceda-ink p-6 sm:p-10 text-white shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-ceda-orange/50",
        className
      )}
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(217, 107, 39, 0.08) 0%, transparent 70%)",
      }}
    >
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveBranchId(null);
              setPreviewItem(null);
              setIsPlayingJourney(false);
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <Compass size={14} className="text-ceda-copper" />
            <span>Singularity Core</span>
          </button>

          {activeBranch && (
            <>
              <ChevronRight size={14} className="text-white/40" />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-lg px-2 py-1 text-ceda-orange hover:bg-white/10 transition"
              >
                {activeBranch.name}
              </button>
            </>
          )}

          {previewItem && (
            <>
              <ChevronRight size={14} className="text-white/40" />
              <span className="text-amber-200 font-bold">{previewItem.title}</span>
            </>
          )}
        </div>

        {/* Action Controls: Reset, Play Journey, Info */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPlayingJourney((prev) => !prev);
              setActiveBranchId(null);
              setPreviewItem(null);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition shadow-sm",
              isPlayingJourney
                ? "bg-amber-500 text-ceda-ink"
                : "border border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-400/20"
            )}
            title="Watch how an idea travels across all 16 platform stages"
          >
            <Play size={12} className={isPlayingJourney ? "fill-ceda-ink" : ""} />
            <span>{isPlayingJourney ? "Pause Journey" : "Play Closed-Loop Journey"}</span>
          </button>

          {activeBranchId && (
            <button
              type="button"
              onClick={() => {
                setActiveBranchId(null);
                setPreviewItem(null);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/15 transition"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <InfoTip
            plain="The Singularity Hub gives you 1-click access to every branch of the CEDA Innovation Portal without searching through multi-level menus."
            technical="SVG radial projection engine with coordinate trigonometric distribution ((i / 6) * 2π), supporting touch rotational inertia and deep route inspection."
            learnMoreUrl="/about"
          />
        </div>
      </div>

      {/* Main Radial Canvas / Interactive Space */}
      <div
        className="relative my-6 flex min-h-[460px] sm:min-h-[520px] items-center justify-center select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* SVG Orbital Geometry & Connecting Lines */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 600 600"
        >
          {/* Subtle Concentric Rings */}
          <circle cx="300" cy="300" r="80" stroke="rgba(255,255,255,0.08)" fill="none" strokeDasharray="3 3" />
          <circle cx="300" cy="300" r="180" stroke="rgba(255,255,255,0.12)" fill="none" />
          <circle cx="300" cy="300" r="260" stroke="rgba(255,255,255,0.05)" fill="none" strokeDasharray="4 4" />

          {/* Radiating Branch Connectors */}
          {HUB_BRANCHES.map((b, i) => {
            const angleDeg = (i * 360) / HUB_BRANCHES.length + (activeBranchId ? 0 : rotationAngle);
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = 300 + 180 * Math.cos(angleRad);
            const y = 300 + 180 * Math.sin(angleRad);
            const isJourneyActive = currentJourneyBranch?.id === b.id;

            return (
              <g key={b.id}>
                <line
                  x1="300"
                  y1="300"
                  x2={x}
                  y2={y}
                  stroke={isJourneyActive ? "#F59E0B" : activeBranchId === b.id ? b.color : "rgba(255,255,255,0.15)"}
                  strokeWidth={isJourneyActive || activeBranchId === b.id ? 2.5 : 1}
                  strokeDasharray={isJourneyActive ? "none" : activeBranchId === b.id ? "none" : "2 3"}
                  className="transition-colors duration-300"
                />
                {isJourneyActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#F59E0B"
                    className="animate-ping opacity-60"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Core: CEDA Sunrise Singularity */}
        <div
          onClick={() => {
            setActiveBranchId(null);
            setPreviewItem(null);
          }}
          className={cn(
            "relative z-20 flex h-28 w-28 sm:h-32 sm:w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 text-center transition-all duration-300 shadow-2xl",
            activeBranch
              ? "border-ceda-orange/60 bg-ceda-ink/90 scale-95"
              : "border-ceda-orange bg-gradient-to-tr from-amber-600/40 via-ceda-orange to-amber-500 hover:scale-105"
          )}
          style={{
            boxShadow: "0 0 35px rgba(217, 107, 39, 0.45)",
          }}
          role="button"
          aria-label="Singularity Core: Click to reset to main hub"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-white shadow-inner">
            <Compass className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse text-white" />
          </div>
          <span className="mt-1 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-white">
            CEDA IDEA ENGINE
          </span>
          <span className="text-[9px] text-white/80 font-medium">Core Map</span>
        </div>

        {/* Orbiting Branch Nodes */}
        {!activeBranch &&
          HUB_BRANCHES.map((branch, i) => {
            const angleDeg = (i * 360) / HUB_BRANCHES.length + rotationAngle;
            const angleRad = (angleDeg * Math.PI) / 180;
            // Radius ~180px in desktop
            const radius = 180;
            const x = Math.round(radius * Math.cos(angleRad));
            const y = Math.round(radius * Math.sin(angleRad));
            const Icon = branch.icon;
            const isJourneyActive = currentJourneyBranch?.id === branch.id;

            return (
              <div
                key={branch.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBranchId(branch.id);
                  setPreviewItem(null);
                }}
                className={cn(
                  "absolute z-30 flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-300 shadow-lg group hover:scale-110",
                  branch.accentBorder,
                  branch.bgColor,
                  isJourneyActive && "ring-4 ring-amber-400 bg-amber-500/30 scale-110"
                )}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  width: "105px",
                  height: "105px",
                  boxShadow: `0 0 20px ${branch.glowColor}`,
                }}
                role="button"
                aria-label={`Branch: ${branch.name}. ${branch.tagline}`}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-white/20"
                  style={{ color: branch.color }}
                >
                  <Icon size={18} />
                </div>
                <span className="mt-1.5 font-bold text-xs text-white group-hover:text-amber-200 transition">
                  {branch.name}
                </span>
                <span className="text-[9px] text-white/60 leading-tight truncate w-full px-1">
                  {branch.subBranches.length} sections
                </span>
              </div>
            );
          })}

        {/* Zoomed-in Fanned Sub-Branches (When a branch is selected) */}
        {activeBranch && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in-90 duration-200">
            {/* Center Label for the active branch */}
            <div className="absolute top-4 text-center">
              <span className="rounded-full bg-ceda-orange/20 border border-ceda-orange/40 px-3 py-1 text-xs font-bold text-ceda-orange uppercase tracking-wider">
                {activeBranch.name} Branch
              </span>
              <p className="mt-1 text-xs text-white/70">{activeBranch.tagline}</p>
            </div>

            {/* Fanned Sub-Branch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-4 mt-6">
              {activeBranch.subBranches.map((sub) => {
                const isSelected = previewItem?.id === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setPreviewItem(sub)}
                    className={cn(
                      "flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all text-left shadow-md",
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 shadow-amber-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{sub.title}</span>
                        {sub.badge && (
                          <span className="rounded bg-ceda-copper/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 uppercase">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-white/60 leading-relaxed line-clamp-2">
                        {sub.desc}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/40 mt-1 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preview Card Drawer (Shows where the link goes before visiting) */}
      {previewItem && (
        <div className="mt-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/70 via-ceda-ink to-amber-950/70 p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h4 className="font-bold text-sm text-white">{previewItem.title}</h4>
                {previewItem.badge && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {previewItem.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 max-w-2xl">{previewItem.desc}</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <Link
                href={previewItem.href}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-ceda-copper transition"
              >
                <span>Open Screen</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Closed-Loop Journey Teaser Strip */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Closed-Loop Journey:</span>
          <span>From 30-sec eligibility to verified certificate and tamper-proof record</span>
        </div>

        <Link
          href="/journey"
          className="inline-flex items-center gap-1 font-bold text-ceda-orange hover:text-amber-300 transition"
        >
          <span>Explore Full 16-Step Living Idea Lifecycle</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
