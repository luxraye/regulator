"use client";

import React from "react";
import Link from "next/link";
import { Trophy, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";

export function FeaturedFlagshipCard() {
  const STAGES_TIMELINE = [
    { name: "Registration", status: "ACTIVE", isCurrent: true, dates: "Nov 1 – Nov 25" },
    { name: "Screening", status: "FUTURE", isCurrent: false, dates: "Nov 26 – Nov 28" },
    { name: "Scoring", status: "FUTURE", isCurrent: false, dates: "Nov 29 – Dec 4" },
    { name: "Finals", status: "FUTURE", isCurrent: false, dates: "Dec 5 – Dec 10" },
  ];

  return (
    <section className="bg-white py-14 sm:py-16 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-ceda-copper/20 bg-gradient-to-br from-ceda-sand/80 via-white to-ceda-sand/40 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-ceda-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Featured National Challenge
                </span>

                {/* Rules Seal Badge with InfoTip */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>Rules Seal ✓</span>
                  <InfoTip
                    plain="Rules seal: proof that judging criteria, scoring weights, and dates are locked and cannot be changed during the competition."
                    technical="Rules seal hash: b4a1406475...d91c computed via canonical JSON and SHA-256."
                    learnMoreUrl="/instances/ceda-hackathon-2026"
                  />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ceda-ink tracking-tight">
                CEDA Innovation Management Portal Hackathon 2026
              </h2>

              <p className="text-xs sm:text-sm text-ceda-slate leading-relaxed">
                Design and build Botswana&apos;s next-generation platform for citizen entrepreneurship. Open to citizen youth businesses (18–35), with P95,000 in equity-free prize grants and transparent scoring.
              </p>

              {/* Quick Key Facts */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-ceda-copper pt-1">
                <span className="flex items-center gap-1">
                  <Trophy size={14} /> P95,000 Total Prize Pool
                </span>
                <span>•</span>
                <span>10 Structured Stages</span>
                <span>•</span>
                <span>100% Citizen Youth Eligibility</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/instances/ceda-hackathon-2026"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-ceda-copper transition"
              >
                <span>View Challenge &amp; Apply</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/instances"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-5 py-3 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
              >
                <span>Browse All Competitions</span>
              </Link>
            </div>
          </div>

          {/* Visual Timeline Bar with "We are here" marker */}
          <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-ceda-ink flex items-center gap-1.5">
                <Clock size={14} className="text-ceda-orange animate-pulse" />
                <span>Current Competition Timeline</span>
              </span>
              <span className="text-ceda-copper">Active Window: Registration</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {STAGES_TIMELINE.map((stage, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl p-3 border text-xs transition",
                    stage.isCurrent
                      ? "border-ceda-orange bg-orange-50/70 font-semibold shadow-xs"
                      : "border-border bg-slate-50/60 text-ceda-slate"
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase">
                    <span>Phase {idx + 1}</span>
                    {stage.isCurrent && (
                      <span className="rounded-full bg-ceda-orange text-white px-1.5 py-0.2 text-[9px] font-bold">
                        We are here
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-ceda-ink mt-1">{stage.name}</div>
                  <div className="text-[10px] text-ceda-slate mt-0.5">{stage.dates}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
