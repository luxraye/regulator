"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Scale, ShieldCheck, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";

interface PersonaTab {
  id: string;
  label: string;
  icon: React.ElementType;
  tagline: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  fairnessTitle: string;
  fairnessPlain: string;
  fairnessTech: string;
  ctaText: string;
  ctaHref: string;
}

const TABS: PersonaTab[] = [
  {
    id: "innovators",
    label: "Innovators",
    icon: Users,
    tagline: "Enter with confidence: pure merit, zero gatekeeping",
    image: "/photos/team-coding.webp",
    imageAlt: "Software development team collaborating at dual-screen workstations",
    bullets: [
      "Every application gets an immutable signed receipt proving submission timestamp and contents.",
      "Evaluators cannot see your name, gender, or company identity during technical scoring.",
      "Follow real-time progress across all 16 stages via web or SMS without using mobile data.",
    ],
    fairnessTitle: "Signed Receipt & Blind Scoring",
    fairnessPlain: "Your identity is hidden from expert evaluators, and a cryptographic receipt protects your intellectual property.",
    fairnessTech: "Double-blind evaluator query scoping with SHA-256 HMAC submission fingerprinting.",
    ctaText: "Check My Eligibility & Apply",
    ctaHref: "/eligibility",
  },
  {
    id: "evaluators",
    label: "Evaluators",
    icon: Scale,
    tagline: "Expert review without administrative hassle or bias",
    image: "/photos/evaluator.webp",
    imageAlt: "Adjudicator reviewing scoring criteria and metrics on a strategy whiteboard",
    bullets: [
      "Sign an enforceable 'No Conflict of Interest' declaration before reviewing any assigned dossier.",
      "Intuitive 100-point rubric breakdown with clear criteria descriptions and qualitative feedback boxes.",
      "Automated variance detection prompts collaborative consensus sessions when scores diverge.",
    ],
    fairnessTitle: "Conflict Declaration & Variance Check",
    fairnessPlain: "Evaluators declare zero conflict before scoring, and divergent marks trigger committee consensus sessions.",
    fairnessTech: "Delta variance calculations flagging any pairwise evaluator discrepancy exceeding threshold.",
    ctaText: "Sign In as Demo Evaluator",
    ctaHref: "/judges",
  },
  {
    id: "ceda-team",
    label: "CEDA Team",
    icon: ShieldCheck,
    tagline: "Institutional oversight backed by tamper-proof audit records",
    image: "/photos/founder-portrait.webp",
    imageAlt: "CEDA funded founder standing proudly outside commercial tech enterprise",
    bullets: [
      "Real-time pipeline dashboard monitoring applicant intake across all 16 Botswana districts.",
      "Pre-flight security guards automatically test uploads for file safety and malware signatures.",
      "Every single score, review, and board disbursement is sealed in an unchangeable audit ledger.",
    ],
    fairnessTitle: "Tamper-Proof Activity Record",
    fairnessPlain: "Every action is logged in an activity record that cannot be edited or erased by any user.",
    fairnessTech: "Append-only hash-chained ledger storing parent hash pointers for cryptographically auditable governance.",
    ctaText: "Explore Administrative Console",
    ctaHref: "/judges",
  },
  {
    id: "partners",
    label: "Partners",
    icon: Building2,
    tagline: "Co-brand and deploy enterprise challenges with BDIH and BTC",
    image: "/photos/founders-meeting.webp",
    imageAlt: "Three startup founders collaborating around a laptop in a brightly lit modern office",
    bullets: [
      "Deploy custom innovation tracks with authentic brand palettes, guidelines, and domain scoping.",
      "Direct API access to integrate with corporate telemetry, 5G IoT networks, or incubation hubs.",
      "Maintain isolated role management and confidential candidate screening queues.",
    ],
    fairnessTitle: "Multi-Tenant Workspace Isolation",
    fairnessPlain: "Partners manage their own competitions, judges, and budgets while sharing CEDA's verified infrastructure.",
    fairnessTech: "Row-level tenant isolation enforced by partnerId relational foreign keys and scoped API keys.",
    ctaText: "Explore Partner Tracks",
    ctaHref: "/instances",
  },
];

export function WhoItsForTabs() {
  const [activeTabId, setActiveTabId] = useState<string>("innovators");
  const current = TABS.find((t) => t.id === activeTabId) ?? TABS[0];

  return (
    <section className="bg-white py-16 sm:py-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
            Fairness For Everyone
          </span>
          <h2 className="text-3xl font-extrabold text-ceda-ink sm:text-4xl">
            Who It&apos;s For
          </h2>
          <p className="text-sm sm:text-base text-ceda-slate leading-relaxed">
            Judged on the idea, not on who you know. Built to give every founder, judge, and partner complete peace of mind.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isSelected = t.id === activeTabId;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTabId(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all",
                  isSelected
                    ? "bg-ceda-orange text-white shadow-md scale-105"
                    : "bg-slate-100 text-ceda-slate hover:bg-slate-200 hover:text-ceda-ink"
                )}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Card Content */}
        <div className="rounded-3xl border border-border bg-slate-50/60 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column: Explanatory Bullets & Actions */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ceda-copper">
                  {current.label} Platform Experience
                </span>
                <h3 className="mt-1 text-2xl font-extrabold text-ceda-ink sm:text-3xl">
                  {current.tagline}
                </h3>
              </div>

              {/* 3 Plain Bullets */}
              <ul className="space-y-3">
                {current.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-ceda-slate leading-relaxed">
                    <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Fairness Callout with InfoTip */}
              <div className="flex items-center justify-between rounded-2xl border border-ceda-copper/20 bg-white p-4 shadow-xs">
                <div>
                  <span className="block font-bold text-xs text-ceda-ink">{current.fairnessTitle}</span>
                  <span className="block text-[11px] text-ceda-slate mt-0.5">{current.fairnessPlain}</span>
                </div>
                <InfoTip
                  plain={current.fairnessPlain}
                  technical={current.fairnessTech}
                  ariaLabel={`Fairness details for ${current.label}`}
                />
              </div>

              {/* Action Button */}
              <div>
                <Link
                  href={current.ctaHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-ceda-orange px-6 py-3 text-xs font-bold text-white shadow hover:bg-ceda-copper transition"
                >
                  <span>{current.ctaText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column: High Quality Photo (No Duplicates) */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-md">
              <Image
                src={current.image}
                alt={current.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                {current.imageAlt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
