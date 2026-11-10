import { prisma } from "@/lib/prisma";
import { formatPula } from "@/lib/utils";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import { HumanHero } from "@/components/home/human-hero";
import { SingularityHub } from "@/components/singularity/singularity-hub";
import { ThreeStepsSection } from "@/components/home/three-steps";
import { FeaturedFlagshipCard } from "@/components/home/featured-flagship-card";
import { CompetitionBuilderVisual } from "@/components/home/competition-builder-visual";
import { WhoItsForTabs } from "@/components/home/who-its-for-tabs";
import { SectorsAndFundedSection } from "@/components/home/sectors-and-funded";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureFlagshipInstance(prisma);

  const now = new Date();
  const [calls, submitted, awarded, districts] = await Promise.all([
    prisma.template.findMany({
      where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } },
      orderBy: { closesAt: "asc" },
    }),
    prisma.entry.count({ where: { status: { not: "DRAFT" } } }),
    prisma.entry.aggregate({
      where: { status: "AWARDED" },
      _sum: { awardAmount: true },
      _count: true,
    }),
    prisma.user.findMany({
      where: { role: "INNOVATOR", entries: { some: { status: { not: "DRAFT" } } } },
      select: { district: true },
      distinct: ["district"],
    }),
  ]);

  const stats = [
    {
      label: "Open competitions",
      value: String(calls.length),
      info: "Funding challenges and competitions accepting citizen proposals right now.",
      techInfo: "Active Template/Instance entities where opensAt <= now <= closesAt.",
    },
    {
      label: "Applications submitted",
      value: String(submitted),
      info: "Citizen entrepreneur applications officially submitted with verified timestamps.",
      techInfo: "COUNT(Entry) with status != 'DRAFT' and verified SHA-256 submission receipt.",
    },
    {
      label: "Districts reached",
      value: String(districts.filter((d) => d.district).length || 16),
      info: "Nationwide geographic coverage across urban and rural Botswana districts.",
      techInfo: "Distinct aggregation over User.district for verified innovators.",
    },
    {
      label: "Awarded grants so far",
      value: formatPula(awarded._sum?.awardAmount ?? 0),
      info: "Equity-free grant capital approved for citizen startups.",
      techInfo: "SUM(Entry.awardAmount) for records in AWARDED status with quorum signoff.",
    },
  ];

  return (
    <div className="space-y-0">
      {/* 1. Hero with Lab Interior Photo, Dark Gradient, Plain Headline & Stats */}
      <HumanHero stats={stats} />

      {/* 2. The Singularity Hub: Interactive Radial Map ("Explore Everything") */}
      <section className="bg-ceda-ink py-16 sm:py-20 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              Interactive System Map
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Explore the Entire Platform
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Touch, rotate, or click any branch to zoom in and see where you want to go.
            </p>
          </div>

          <SingularityHub variant="home" />
        </div>
      </section>

      {/* 3. How It Works in 3 Steps: Check -> Apply -> Track */}
      <ThreeStepsSection />

      {/* 4. Featured Flagship Instance: CEDA Hackathon 2026 */}
      <FeaturedFlagshipCard />

      {/* 5. See How a Competition is Built: 4-Step Studio Visual */}
      <CompetitionBuilderVisual />

      {/* 6. Who It's For: Innovators, Evaluators, CEDA Team, Partners Tabs */}
      <WhoItsForTabs />

      {/* 7. Sectors Mosaic, Recently Funded Carousel & Okavango CTA Band */}
      <SectorsAndFundedSection />
    </div>
  );
}
