"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";

interface StatItem {
  label: string;
  value: string;
  info: string;
  techInfo?: string;
}

export function HumanHero({ stats }: { stats: StatItem[] }) {
  return (
    <section className="relative overflow-hidden bg-ceda-ink text-white">
      {/* Full-bleed Lab Interior Photo Background with Dark Gradient and Subtle Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/photos/hero-lab.webp"
          alt="Young woman in safety glasses inspecting circuits in an advanced electronics innovation lab in Gaborone"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-105 motion-reduce:transform-none opacity-40 mix-blend-luminosity"
        />
        {/* Layered gradients for readability and warm CEDA glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-ceda-ink via-ceda-ink/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ceda-ink via-ceda-ink/90 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 space-y-12">
        <div className="max-w-3xl space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-200">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Citizen Entrepreneurial Development Agency</span>
          </div>

          {/* Plain Human Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            Your idea. CEDA&apos;s backing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              A fair shot.
            </span>
          </h1>

          {/* Plain Human Subline */}
          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl font-normal">
            Enter CEDA competitions online, see exactly how you&apos;ll be judged, and follow your application at every step.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/instances"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-orange px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-ceda-copper transition"
            >
              <span>See Open Competitions</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              <span>Am I Eligible? (30 seconds)</span>
            </Link>

            <Link
              href="/judges"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white transition py-2"
            >
              <Compass size={14} className="text-amber-400" />
              <span>Take the 3-minute judges&apos; tour →</span>
            </Link>
          </div>
        </div>

        {/* 4 Animated Stat Counters with InfoTips */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-8 sm:grid-cols-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                {s.label}
              </span>
              <span className="mt-1 block text-2xl sm:text-3xl font-extrabold text-white">
                {s.value}
              </span>

              {/* ⓘ Info Tip in bottom-right corner */}
              <div className="absolute bottom-2.5 right-2.5">
                <InfoTip
                  plain={s.info}
                  technical={s.techInfo}
                  ariaLabel={`Info about ${s.label}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
