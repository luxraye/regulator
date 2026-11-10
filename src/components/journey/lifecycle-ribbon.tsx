"use client";

import React from "react";
import Link from "next/link";
import { Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";

export interface LifecycleRibbonProps {
  /** Step number 1 through 16 */
  currentStep: number;
  /** Optional custom step title override */
  stepTitle?: string;
  className?: string;
}

export const LIFECYCLE_STEPS = [
  { step: 1, name: "Eligibility", href: "/eligibility", desc: "Citizen youth check passed" },
  { step: 2, name: "Team Setup", href: "/register", desc: "Co-founders & Omang verified" },
  { step: 3, name: "Drafting", href: "/dashboard/innovator", desc: "Autosaved dossier & pitch" },
  { step: 4, name: "Submission Check", href: "/dashboard/innovator", desc: "Pre-flight guards green" },
  { step: 5, name: "Submitted", href: "/track", desc: "Signed receipt generated" },
  { step: 6, name: "Screening", href: "/dashboard/admin", desc: "Admin completeness check" },
  { step: 7, name: "Blind Scoring", href: "/dashboard/evaluator", desc: "Independent expert marks" },
  { step: 8, name: "Consensus", href: "/dashboard/panel", desc: "Score variance harmonized" },
  { step: 9, name: "Fair Ranking", href: "/instances/ceda-hackathon-2026", desc: "Leaderboard shortlist" },
  { step: 10, name: "Q&A Clarification", href: "/dashboard/innovator", desc: "Committee query answered" },
  { step: 11, name: "Demo Day", href: "/instances/ceda-hackathon-2026", desc: "Live jury & public vote" },
  { step: 12, name: "Award Decision", href: "/dashboard/panel", desc: "Board funding approved" },
  { step: 13, name: "Certificate", href: "/verify", desc: "Digital credential issued" },
  { step: 14, name: "Funded Showcase", href: "/funded", desc: "Public showcase portfolio" },
  { step: 15, name: "Notifications", href: "/demo-inbox", desc: "Multi-channel alerts sent" },
  { step: 16, name: "Activity Record", href: "/dashboard/superadmin", desc: "Tamper-proof audit sealed" },
];

/**
 * Slim lifecycle ribbon (Addendum 12b requirement).
 * Shows judges and visitors where the current screen sits inside the 16-step closed loop.
 */
export function LifecycleRibbon({
  currentStep,
  stepTitle,
  className,
}: LifecycleRibbonProps) {
  const current = LIFECYCLE_STEPS.find((s) => s.step === currentStep) ?? LIFECYCLE_STEPS[0];
  const prevStep = LIFECYCLE_STEPS.find((s) => s.step === currentStep - 1);
  const nextStep = LIFECYCLE_STEPS.find((s) => s.step === currentStep + 1);

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 border-b border-ceda-copper/20 bg-gradient-to-r from-ceda-sand/80 via-white to-ceda-sand/80 px-4 py-2 text-xs text-ceda-ink shadow-sm",
        className
      )}
    >
      {/* Left: Journey indicator */}
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ceda-orange text-[10px] font-extrabold text-white">
          {current.step}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-ceda-copper uppercase tracking-wider text-[10px]">
            Idea Lifecycle Stage {current.step} of 16:
          </span>
          <span className="font-semibold text-ceda-ink">
            {stepTitle || current.name}
          </span>
          <span className="hidden sm:inline text-ceda-slate text-[11px]">
            — {current.desc}
          </span>
        </div>
      </div>

      {/* Right: Step controls & Info */}
      <div className="flex items-center gap-2">
        <Link
          href="/journey"
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-ceda-copper border border-ceda-copper/30 hover:bg-ceda-copper hover:text-white transition shadow-xs"
        >
          <Compass size={12} />
          <span>Full 16-Step Journey</span>
        </Link>

        {prevStep && (
          <Link
            href={prevStep.href}
            className="hidden sm:inline-flex rounded p-1 text-ceda-slate hover:text-ceda-copper transition"
            title={`Previous: Step ${prevStep.step} (${prevStep.name})`}
            aria-label="Previous lifecycle step"
          >
            <ChevronLeft size={14} />
          </Link>
        )}

        {nextStep && (
          <Link
            href={nextStep.href}
            className="hidden sm:inline-flex rounded p-1 text-ceda-slate hover:text-ceda-copper transition"
            title={`Next: Step ${nextStep.step} (${nextStep.name})`}
            aria-label="Next lifecycle step"
          >
            <ChevronRight size={14} />
          </Link>
        )}

        <InfoTip
          plain="Every innovation follows this 16-step closed loop, from initial eligibility check to the verified certificate and permanent activity record."
          technical="Linked through deterministic references, SHA-256 state receipts, and hash-chained audit nodes ensuring zero out-of-order stage mutations."
          learnMoreUrl="/journey"
        />
      </div>
    </div>
  );
}
