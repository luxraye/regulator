import Link from "next/link";
import Image from "next/image";
import { ArrowRight, EyeOff, FileCheck2, Fingerprint, Gavel, Scale, ClipboardList, Lightbulb, LineChart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DATA_TYPES, typeLabels } from "@/lib/labels";
import { formatPula } from "@/lib/utils";
import { Hero, HowItWorks } from "@/components/home/hero";
import { CallCard } from "@/components/ideas/call-card";
import { BlueBackdrop } from "@/components/home/blue-backdrop";
import { PWAInstallSection } from "@/components/home/pwa-install-section";
import { FundedCard } from "@/components/funded/funded-card";
import { fundedShowcase } from "@/lib/funded";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureFlagshipInstance(prisma);
  const now = new Date();
  const [calls, submitted, awarded, districts, funded] = await Promise.all([
    prisma.template.findMany({ where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } }, orderBy: { closesAt: "asc" } }),
    prisma.entry.count({ where: { status: { not: "DRAFT" } } }),
    prisma.entry.aggregate({ where: { status: "AWARDED" }, _sum: { awardAmount: true }, _count: true }),
    prisma.user.findMany({ where: { role: "INNOVATOR", entries: { some: { status: { not: "DRAFT" } } } }, select: { district: true }, distinct: ["district"] }),
    fundedShowcase(3),
  ]);

  const stats = [
    { label: "Open calls", value: String(calls.length) },
    { label: "Ideas submitted", value: String(submitted) },
    { label: "Districts reached", value: String(districts.filter((d) => d.district).length) },
    { label: "Awarded so far", value: formatPula(awarded._sum?.awardAmount ?? 0) },
  ];

  return (
    <>
      <Hero stats={stats} />

      {/* Featured Flagship Challenge Section */}
      <section className="bg-white py-12 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-ceda-sand/70 via-white to-ceda-sand/40 p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-ceda-orange px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    Featured Flagship Challenge
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    LIVE &amp; VERIFIABLE
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ceda-ink">
                  CEDA Innovation Management Portal Hackathon 2026
                </h2>
                <p className="text-sm text-ceda-slate leading-relaxed">
                  Design, build and deploy Botswana&apos;s next-generation innovation portal. Open to youth-owned citizen businesses, with P95,000 in total prizes and judging rules sealed with a tamper-evident hash.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ceda-copper pt-1">
                  <span>🏆 P95,000 Prize Pool</span>
                  <span>•</span>
                  <span>⚡ 10 Programmable Stages</span>
                  <span>•</span>
                  <span>🛡 Cryptographic Rules Fingerprint</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                <Link
                  href="/instances/ceda-hackathon-2026"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ceda-orange px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-ceda-copper transition"
                >
                  <span>Explore Flagship Hackathon</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/instances"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
                >
                  <span>Browse All Challenges</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ceda-sand py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-ceda-ink">Open calls</h2>
              <p className="mt-1 text-muted-foreground">Each call names its sector, stage, funding and how ideas will be scored.</p>
            </div>
            <Link href="/calls" className="inline-flex items-center gap-1 font-medium text-ceda-orange hover:underline">
              All calls <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {calls.slice(0, 3).map((c) => (
              <CallCard
                key={c.id}
                call={c}
                action={
                  <Link href={`/calls/${c.code}`} className="inline-flex items-center gap-1 text-sm font-medium text-ceda-orange hover:underline">
                    Details and criteria <ArrowRight size={14} />
                  </Link>
                }
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="bg-ceda-sand py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-3xl font-bold text-ceda-ink">Priority sectors</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Calls are aimed at the sectors that diversify Botswana&apos;s economy beyond diamonds, at every stage from first idea to export.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {DATA_TYPES.map((dt) => (
              <Link key={dt} href="/calls" className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={typeLabels[dt].photo} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ceda-ink/90 via-ceda-ink/20 to-transparent" />
                <p className="absolute bottom-3 left-4 right-4 font-semibold text-white sm:text-lg">{typeLabels[dt].full}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-3xl font-bold text-ceda-ink">One portal, four roles</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">Everyone sees only what their job needs.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Lightbulb />, title: "Innovators", body: "Check eligibility, apply, save drafts, follow the five stages, answer CEDA's questions and resubmit." },
              { icon: <ClipboardList />, title: "Evaluators", body: "Declare conflicts, then score ideas blind on weighted criteria, with written feedback for the founder." },
              { icon: <Gavel />, title: "Adjudication panel", body: "See a ranked shortlist with every scorecard side by side, spot disagreements, approve and award." },
              { icon: <LineChart />, title: "CEDA programme team", body: "Open calls, screen, assign evaluators, chase overdue scores and export participation reports." },
            ].map((r) => (
              <div key={r.title} className="rounded-2xl border border-border p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-ceda-orange/10 text-ceda-orange [&>svg]:h-5 [&>svg]:w-5">{r.icon}</div>
                <h3 className="mb-2 font-semibold text-ceda-ink">{r.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {funded.length > 0 && (
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ceda-orange">Recognition</p>
                <h2 className="text-3xl font-bold text-ceda-ink">Recently funded</h2>
                <p className="mt-1 text-muted-foreground">Young founders whose ideas made it all the way through. Every award comes with a certificate anyone can check.</p>
              </div>
              <Link href="/funded" className="inline-flex items-center gap-1 font-medium text-ceda-orange hover:underline">
                All funded innovators <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {funded.map((f) => <FundedCard key={f.referenceCode} f={f} />)}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden py-16 text-white">
        <BlueBackdrop />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ceda-amber">Fair by design</p>
          <h2 className="mb-3 text-3xl font-bold">Judged on the idea, not on who you know</h2>
          <p className="mx-auto mb-10 max-w-2xl text-white/80">
            Young founders often tell us the hardest part is not knowing what happened to their application. Every step here is recorded and explainable.
          </p>
          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <EyeOff className="h-5 w-5 text-ceda-orange" />, title: "Blind scoring", body: "Evaluators never see your name, Omang, age or phone number.", border: "border-ceda-orange/30", bg: "bg-ceda-orange/20" },
              { icon: <Scale className="h-5 w-5 text-ceda-green" />, title: "Conflicts declared", body: "Each evaluator confirms no link to your company before opening your idea.", border: "border-ceda-green/30", bg: "bg-ceda-green/20" },
              { icon: <Fingerprint className="h-5 w-5 text-ceda-amber" />, title: "Signed receipt", body: "Your answers and documents are hashed and signed, so nobody can change them later.", border: "border-ceda-amber/30", bg: "bg-ceda-amber/20" },
              { icon: <FileCheck2 className="h-5 w-5 text-ceda-orange" />, title: "Feedback for everyone", body: "Win or not, you get the scores and evaluator comments to improve your next pitch.", border: "border-ceda-orange/30", bg: "bg-ceda-orange/20" },
            ].map((p) => (
              <div key={p.title} className={`rounded-xl border bg-ceda-ink/45 p-5 backdrop-blur-sm ${p.border}`}>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${p.bg}`}>{p.icon}</div>
                <h3 className="mb-1 font-semibold">{p.title}</h3>
                <p className="text-sm text-white/80">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PWAInstallSection />

      <section className="bg-white pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            <Image src="/photos/team-laptop.webp" alt="" fill sizes="56rem" className="object-cover" />
            <div className="relative bg-ceda-ink/85 p-8 text-center text-white sm:p-12">
              <h2 className="mb-3 text-2xl font-bold lg:text-3xl">Aged 18 to 35 with an idea for Botswana?</h2>
              <p className="mx-auto mb-6 max-w-xl text-white/80">Check you qualify in 30 seconds, then start your application. Drafts save as you go.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/eligibility" className="rounded-lg bg-ceda-amber px-6 py-3 font-semibold text-ceda-ink hover:bg-ceda-amber/90">Am I eligible?</Link>
                <Link href="/register" className="rounded-lg bg-white/10 px-6 py-3 font-medium hover:bg-white/20">Create an account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
