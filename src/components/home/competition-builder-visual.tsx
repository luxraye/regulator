"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Calendar,
  Scale,
  ShieldCheck,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";

interface StudioStep {
  id: number;
  label: string;
  short: string;
  icon: React.ElementType;
  heading: string;
  desc: string;
  interactivePreview: React.ReactNode;
  info: string;
  techInfo: string;
}

export function CompetitionBuilderVisual() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const STEPS: StudioStep[] = [
    {
      id: 1,
      label: "Step 1",
      short: "Pick a Template",
      icon: Layers,
      heading: "1. Start with a Tested Competition Template",
      desc: "Choose from pre-configured blueprints designed for software hackathons, commercial grants, or youth innovation challenges.",
      info: "Templates provide pre-tested evaluation rubrics, stage timelines, and citizen eligibility rules.",
      techInfo: "Template JSON schemas enforcing invariant type contracts and baseline guard configurations.",
      interactivePreview: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { name: "National Hackathon", tag: "10 Stages • P95k Prize", active: true },
              { name: "Commercial Seed Grant", tag: "4 Stages • P150k Prize", active: false },
              { name: "Digital Innovation Call", tag: "3 Stages • P75k Prize", active: false },
            ].map((t, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  t.active
                    ? "border-ceda-orange bg-white shadow-sm ring-1 ring-ceda-orange/40"
                    : "border-border bg-slate-50 opacity-70"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ceda-ink">{t.name}</span>
                  {t.active && <Check size={14} className="text-ceda-orange" />}
                </div>
                <span className="mt-1 block text-[10px] text-ceda-slate">{t.tag}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ceda-slate italic">
            ✓ Template loaded: Flagship Hackathon blueprint with 10 sequential progression gates.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      label: "Step 2",
      short: "Set Dates & Rules",
      icon: Calendar,
      heading: "2. Set Dates and Who Can Enter",
      desc: "Specify application deadlines, scoring windows, and eligibility constraints (e.g. 18–35 citizen youth, 1–5 team members).",
      info: "Locks in timeline stages and sets automated checks so only eligible citizen applicants can submit.",
      techInfo: "Compiles chronological date range assertions with automatic stage status progression (PAST | ACTIVE | FUTURE).",
      interactivePreview: (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-white p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-semibold text-ceda-slate">Citizen Eligibility:</span>
              <span className="font-bold text-emerald-700">Citizen Youth (18–35) Only</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-semibold text-ceda-slate">Team Size Constraints:</span>
              <span className="font-bold text-ceda-ink">1 to 5 Members per Team</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ceda-slate">Submission Window:</span>
              <span className="font-bold text-ceda-copper">Nov 1 – Nov 25, 2026</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      label: "Step 3",
      short: "Choose Scoring",
      icon: Scale,
      heading: "3. Choose How It&apos;s Judged",
      desc: "Define the 100-point scoring rubric, enable blind evaluation, and set consensus review thresholds.",
      info: "Customizes scoring criteria weights (e.g. Technical 40%, Market 35%, Employment 25%) and enables blind grading.",
      techInfo: "Normalized weighted rubric array summing strictly to 100% with configurable disagreement threshold.",
      interactivePreview: (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-white p-3 space-y-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[11px]">
                <span>Technical Architecture & Innovation</span>
                <span className="text-ceda-copper font-bold">40%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-ceda-orange rounded-full w-[40%]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[11px]">
                <span>Market Viability & Commercial Traction</span>
                <span className="text-ceda-copper font-bold">35%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[35%]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-[11px]">
                <span>Local Job Creation & Knowledge Transfer</span>
                <span className="text-ceda-copper font-bold">25%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[25%]" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      label: "Step 4",
      short: "Seal & Publish",
      icon: ShieldCheck,
      heading: "4. Publish, and the Rules Get Sealed",
      desc: "Click publish. The system locks all rules with a digital rules seal, guaranteeing zero unannounced changes.",
      info: "Once published, the rules cannot be altered behind closed doors. Any update creates a visible new version with audit reasons.",
      techInfo: "Canonical JSON serialization hashed with SHA-256 to create an immutable rulesHash stored on the blockchain/ledger.",
      interactivePreview: (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700" />
            <span className="font-bold">Rules Seal Active &amp; Verified</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-normal">
            Rules are permanently sealed. Judges, sponsors, and applicants all see the exact same immutable criteria.
          </p>
          <div className="rounded bg-white/80 p-2 font-mono text-[10px] text-emerald-900 border border-emerald-200">
            Rules Seal: <code>b4a1406475...d91c</code> (Verified ✓)
          </div>
        </div>
      ),
    },
  ];

  const current = STEPS.find((s) => s.id === activeStep) ?? STEPS[0];

  return (
    <section className="bg-slate-50 py-16 sm:py-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
            Instance Studio Interactive Visual
          </span>
          <h2 className="text-3xl font-extrabold text-ceda-ink sm:text-4xl">
            See How a Competition is Built
          </h2>
          <p className="text-sm sm:text-base text-ceda-slate leading-relaxed">
            Every challenge on the platform runs on an &ldquo;Instance&rdquo;: an automated competition blueprint with locked, checkable rules.
          </p>
        </div>

        {/* 4-Step Interactive Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isSelected = s.id === activeStep;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl border p-3.5 text-left transition-all",
                  isSelected
                    ? "border-ceda-orange bg-white shadow-md ring-2 ring-ceda-orange/20"
                    : "border-border bg-white/60 hover:bg-white text-ceda-slate"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    isSelected ? "bg-ceda-orange text-white" : "bg-slate-100 text-ceda-slate"
                  )}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-ceda-copper">
                    {s.label}
                  </span>
                  <span className="block font-bold text-xs text-ceda-ink">
                    {s.short}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Interactive Showcase Card */}
        <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-ceda-ink">{current.heading}</h3>
              <p className="mt-1 text-xs sm:text-sm text-ceda-slate leading-relaxed">
                {current.desc}
              </p>
            </div>
            <InfoTip plain={current.info} technical={current.techInfo} />
          </div>

          {/* Interactive Screen Preview */}
          <div className="rounded-2xl border border-border/80 bg-slate-50/70 p-4">
            {current.interactivePreview}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              href="/judges"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ceda-copper hover:underline"
            >
              <span>Explore this in the Judges&apos; Tour</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/dashboard/instances/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-ceda-copper transition"
            >
              <span>Open Studio in Basic Mode</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
