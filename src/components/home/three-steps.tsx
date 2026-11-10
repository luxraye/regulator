"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileEdit, Compass, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";

interface StepCard {
  number: string;
  title: string;
  subtitle: string;
  href: string;
  ctaText: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  details: string[];
  infoPlain: string;
  infoTech: string;
}

const STEPS: StepCard[] = [
  {
    number: "01",
    title: "Check",
    subtitle: "See if you're eligible in 30 seconds before you begin",
    href: "/eligibility",
    ctaText: "Check My Eligibility",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    details: [
      "Open to Botswana citizens aged 18 to 35 years old.",
      "Requires at least 51% citizen shareholding (or 100% for youth-exclusive calls).",
      "Immediate pre-qualification confirmation without creating an account first.",
    ],
    infoPlain: "A quick 4-question check to verify citizen youth guidelines before filling out forms.",
    infoTech: "Client-side evaluation of statutory citizenship and age rules without database writes.",
  },
  {
    number: "02",
    title: "Apply",
    subtitle: "Submit your idea, pitch deck, and budget with autosave",
    href: "/calls",
    ctaText: "Browse Open Calls",
    icon: FileEdit,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    details: [
      "Autosaving draft dossier preserves every paragraph if power or data drops.",
      "Clear character limits and writing guides for each question.",
      "Instant file safety check flags any unformatted files before final submission.",
    ],
    infoPlain: "Your application is saved as you type, and files are tested for safety before final lock.",
    infoTech: "Automated pre-flight security scan verifying magic-byte headers, ClamAV clean signatures, and size budgets.",
  },
  {
    number: "03",
    title: "Track",
    subtitle: "Follow your application live at every step with your code",
    href: "/track",
    ctaText: "Track My Progress",
    icon: Compass,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    details: [
      "Receive a digital receipt with exact timestamp upon submission.",
      "Follow real-time status across screening, blind scoring, and committee decisions.",
      "Check progress anytime on any basic phone by dialling *161# with zero mobile data.",
    ],
    infoPlain: "A private tracking reference lets you check real-time progress from any phone or computer.",
    infoTech: "Immutable state machine logging each evaluation phase transition with SHA-256 receipts.",
  },
];

export function ThreeStepsSection() {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({
    "01": true,
    "02": false,
    "03": false,
  });

  const toggle = (num: string) => {
    setOpenDetails((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-16 sm:py-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-ceda-ink sm:text-4xl">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-ceda-slate leading-relaxed">
            From your first idea to a funded commercial company: clear steps, plain words, and no hidden surprises.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isOpen = Boolean(openDetails[s.number]);

            return (
              <div
                key={s.number}
                className="relative flex flex-col justify-between rounded-3xl border border-border bg-slate-50/60 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-ceda-copper/60 group-hover:text-ceda-copper transition">
                      {s.number}
                    </span>
                    <div className={cn("rounded-2xl p-2.5 border", s.bgColor)}>
                      <Icon className={cn("h-6 w-6", s.color)} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-ceda-ink">{s.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-ceda-slate leading-relaxed">
                      {s.subtitle}
                    </p>
                  </div>

                  {/* Collapsible "What happens here" accordion */}
                  <div className="pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => toggle(s.number)}
                      className="flex w-full items-center justify-between text-xs font-bold text-ceda-copper hover:text-ceda-ink transition py-1"
                      aria-expanded={isOpen}
                    >
                      <span>What happens here?</span>
                      <ChevronDown
                        size={14}
                        className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>

                    {isOpen && (
                      <ul className="mt-2.5 space-y-2 text-xs text-ceda-slate animate-in fade-in duration-150">
                        {s.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-ceda-copper mt-1.5 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ceda-ink hover:text-ceda-orange transition"
                  >
                    <span>{s.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>

                  <InfoTip
                    plain={s.infoPlain}
                    technical={s.infoTech}
                    learnMoreUrl={s.href}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
