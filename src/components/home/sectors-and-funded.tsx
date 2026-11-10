"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Phone } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";

interface FundedItem {
  title: string;
  recipient: string;
  award: string;
  sector: string;
  impact: string;
}

const SAMPLE_FUNDED: FundedItem[] = [
  {
    title: "EcoKgalagadi Cold-Chain IoT",
    recipient: "Kgalagadi Tech (Pty) Ltd",
    award: "P150,000 Grant",
    sector: "Agriculture & CleanTech",
    impact: "Solar-powered milk chilling telemetry across 8 rural cattleposts",
  },
  {
    title: "Sediba Water Sensors & Billing",
    recipient: "SmartFlow Systems (Pty) Ltd",
    award: "P100,000 Grant",
    sector: "GovTech & Utilities",
    impact: "Non-revenue water loss monitoring deployed in Maun district",
  },
  {
    title: "Botswana Craft Export Platform",
    recipient: "Kalahari Weavers Collective",
    award: "P75,000 Grant",
    sector: "Creative & Manufacturing",
    impact: "Direct-to-consumer international sales for 45 rural artisan weavers",
  },
];

const SECTORS = [
  {
    title: "Digital & Technology",
    image: "/photos/soldering.webp",
    alt: "Precision soldering on micro-circuit board under focused illumination",
    desc: "AI, fintech, hardware prototyping, and telecom solutions",
  },
  {
    title: "Manufacturing & Textiles",
    image: "/photos/tailor.webp",
    alt: "Artisan tailor precisely guiding fabric through an industrial sewing machine",
    desc: "Apparel, light industrial machining, and value-addition processing",
  },
  {
    title: "Creative Arts & Crafts",
    image: "/photos/basket-weaver.webp",
    alt: "Motswana weaver hand-crafting traditional woven basket with geometric earth-tone patterns",
    desc: "Indigenous basketry, jewelry, digital media, and cultural heritage",
  },
  {
    title: "Eco-Tourism & Conservation",
    image: "/photos/mokoro.webp",
    alt: "Traditional mokoro canoe glides through calm water lilies in northern Botswana wetland",
    desc: "Sustainable lodges, guided expeditions, and biodiversity preservation",
  },
];

export function SectorsAndFundedSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20 space-y-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Part A: Sectors Photo Mosaic */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
                Priority Sectors
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-ceda-ink sm:text-4xl">
                Funded Sectors &amp; Opportunities
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ceda-slate max-w-xl">
                CEDA backs citizen ventures driving national economic diversification, youth employment, and exports.
              </p>
            </div>
            <Link
              href="/instances"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ceda-copper hover:underline shrink-0"
            >
              <span>View Challenges by Sector</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTORS.map((s, idx) => (
              <div
                key={idx}
                className="group relative h-64 rounded-3xl overflow-hidden border border-border shadow-xs hover:shadow-lg transition-all"
              >
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ceda-ink/90 via-ceda-ink/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h3 className="font-bold text-base group-hover:text-amber-200 transition">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-2">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part B: Recently Funded Showcase Carousel */}
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-600 border border-amber-500/20">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-ceda-ink">Recently Awarded Citizen Startups</h3>
                <p className="text-xs text-ceda-slate">
                  Verified grant allocations backed by digital milestone certificates.
                </p>
              </div>
            </div>
            <Link
              href="/funded"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ceda-copper hover:underline shrink-0"
            >
              <span>Explore All Funded Startups</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_FUNDED.map((f, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border bg-slate-50/70 p-4 space-y-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-ceda-sand px-2 py-0.5 text-[10px] font-bold text-ceda-copper uppercase tracking-wider">
                    {f.sector}
                  </span>
                  <span className="font-extrabold text-xs text-emerald-700">
                    {f.award}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ceda-ink">{f.title}</h4>
                  <span className="text-xs text-ceda-slate block mt-0.5">{f.recipient}</span>
                  <p className="text-xs text-ceda-slate mt-2 leading-relaxed">{f.impact}</p>
                </div>
                <div className="pt-2 border-t border-border/50 flex justify-end">
                  <InfoTip
                    plain={`Verified grant of ${f.award} awarded following independent evaluation.`}
                    technical="Multi-signature board quorum signoff record with verified disbursement milestones."
                    learnMoreUrl="/funded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part C: Closing Call to Action Band over Okavango Aerial Photo with Integrated *161# Strip */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Image
              src="/photos/okavango-aerial.webp"
              alt="Aerial panorama of the Okavango Delta water channels and lush green islands at golden hour"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ceda-ink/95 via-ceda-ink/90 to-ceda-ink/70" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-white space-y-8 max-w-3xl">
            <div className="space-y-3">
              <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200 uppercase tracking-wider">
                Start Today
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Turn your innovation into a funded commercial enterprise.
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Check your eligibility in 30 seconds, submit your pitch, and track your application every step of the way with complete transparency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/instances"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-ceda-copper transition"
              >
                <span>Browse Open Challenges</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
              >
                <span>Check My Eligibility</span>
              </Link>
            </div>

            {/* Compact USSD / Offline Access Strip */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/15 text-xs text-white/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 shrink-0">
                <Phone size={14} />
              </div>
              <p>
                <strong>No internet data?</strong> Dial <code className="font-mono font-bold text-amber-300 bg-white/10 px-1.5 py-0.5 rounded">*161#</code> from any mobile phone in Botswana to check application status and challenge deadlines free of charge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
