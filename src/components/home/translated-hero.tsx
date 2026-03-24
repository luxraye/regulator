"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { Phone, Radio, Mail, Globe } from "lucide-react";

export function TranslatedHero() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="bg-bocra-navy text-white relative overflow-hidden">
        {/* Connectivity web pattern */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="web" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1.5" fill="white" />
                <circle cx="0" cy="0" r="1" fill="white" />
                <circle cx="60" cy="0" r="1" fill="white" />
                <circle cx="0" cy="60" r="1" fill="white" />
                <circle cx="60" cy="60" r="1" fill="white" />
                <line x1="30" y1="30" x2="0" y2="0" stroke="white" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="60" y2="0" stroke="white" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="0" y2="60" stroke="white" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="60" y2="60" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#web)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex gap-1.5 mb-6">
              <span className="w-4 h-4 rounded-full bg-bocra-blue" />
              <span className="w-4 h-4 rounded-full bg-bocra-green" />
              <span className="w-4 h-4 rounded-full bg-bocra-amber" />
              <span className="w-4 h-4 rounded-full bg-bocra-orange" />
            </div>
            <p className="text-white/50 text-sm font-medium italic mb-3">
              {t("hero.tagline")}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#how-instances-work"
                className="px-6 py-3 bg-bocra-blue rounded-lg font-medium hover:bg-bocra-blue/80 transition-colors"
              >
                {t("hero.cta.instances")}
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                {t("hero.cta.portal")}
              </Link>
              <Link
                href="/complaints"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                {t("hero.cta.complaint")}
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                {t("hero.cta.register")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-bocra-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: <Phone className="w-6 h-6" />, key: "sector.telecoms" as const },
              { icon: <Radio className="w-6 h-6" />, key: "sector.broadcasting" as const },
              { icon: <Mail className="w-6 h-6" />, key: "sector.postal" as const },
              { icon: <Globe className="w-6 h-6" />, key: "sector.internet" as const },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-bocra-navy font-medium text-sm">
                {s.icon}
                <span>{t(s.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
