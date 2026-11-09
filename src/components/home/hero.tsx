"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { BlueBackdrop } from "@/components/home/blue-backdrop";

export function Hero({ stats }: { stats: { label: string; value: string }[] }) {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-[#0b4a86] text-white">
      <BlueBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ceda-amber">{t("hero.kicker")}</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight lg:text-5xl">{t("hero.title")}</h1>
            <p className="mb-8 text-lg leading-relaxed text-white/80">{t("hero.subtitle")}</p>
            <div className="grid w-full max-w-lg grid-cols-2 gap-3">
              <Link href="/calls" className="flex min-h-12 items-center justify-center rounded-lg bg-ceda-amber px-4 py-3 text-center font-semibold text-ceda-navy transition-colors hover:bg-ceda-amber/90">
                {t("hero.cta.apply")}
              </Link>
              <Link href="/eligibility" className="flex min-h-12 items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-center font-medium transition-colors hover:bg-white/20">
                {t("hero.cta.eligible")}
              </Link>
              <Link href="/track" className="flex min-h-12 items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-center font-medium transition-colors hover:bg-white/20">
                {t("hero.cta.track")}
              </Link>
              <Link href="/register" className="flex min-h-12 items-center justify-center rounded-lg bg-ceda-blue px-4 py-3 text-center font-medium transition-colors hover:bg-ceda-blue/80">
                {t("hero.cta.register")}
              </Link>
            </div>
          </div>
          <div className="relative block">
            <figure className="relative mx-auto w-full max-w-lg">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl shadow-black/30">
                <Image src="/images/hero-innovation.jpg" alt="Young developers building software together at their laptops" fill priority sizes="(min-width: 1024px) 32rem, 100vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ceda-navy/90 to-transparent p-5 pt-16">
                  <p className="text-sm text-white/90">Ideas start at a kitchen table. We help the good ones become companies.</p>
                </div>
              </div>
              <figcaption className="mt-2 text-right text-[11px] text-white/75">
                Photo: Deo photographer, <a href="https://commons.wikimedia.org/wiki/File:Computer_engineer.jpg" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>
              </figcaption>
            </figure>
          </div>
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs uppercase tracking-wide text-white/75">{s.label}</dt>
              <dd className="text-2xl font-bold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const STAGES = [
  { key: "submission", color: "bg-ceda-blue" },
  { key: "review", color: "bg-purple-600" },
  { key: "feedback", color: "bg-ceda-orange" },
  { key: "approval", color: "bg-ceda-green" },
  { key: "award", color: "bg-ceda-amber" },
] as const;

export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-ceda-navy">{t("how.title")}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">{t("how.subtitle")}</p>
        </div>
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.key} className="relative rounded-2xl border border-border bg-ceda-light p-5">
              <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${s.color} ${s.key === "award" ? "text-ceda-navy" : ""}`}>{i + 1}</span>
              <h3 className="mb-2 font-semibold text-ceda-navy">{t(`stage.${s.key}`)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`stage.${s.key}.desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
