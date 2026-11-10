import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Trophy, Calendar, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;
  const partner = await prisma.partner.findUnique({ where: { slug } });
  return {
    title: `${partner?.name || "Partner"} | Innovation Ecosystem`,
    description: `Explore national innovation calls and accelerator challenges run by ${partner?.name || "our partner"}.`,
  };
}

export default async function PublicPartnerPage({ params }: PageProps) {
  const { slug } = params;

  const partner = await prisma.partner.findUnique({
    where: { slug },
    include: {
      instances: {
        where: { status: { in: ["LIVE", "PUBLISHED", "CLOSED"] } },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { entries: true } },
        },
      },
    },
  });

  if (!partner) {
    notFound();
  }

  const primaryColor = partner.primaryColor || "#3a2a24";
  const secondaryColor = partner.secondaryColor || "#d94914";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-ceda-slate">
        <Link href="/instances" className="hover:text-ceda-ink transition">
          ← All Competitions
        </Link>
        <span>•</span>
        <span className="font-semibold text-ceda-copper">{partner.name}</span>
      </div>

      {/* Branded Partner Hero Header */}
      <div
        className="rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden transition-all"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: secondaryColor }}>
            <Building2 size={14} />
            <span>Official Innovation Partner</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            {partner.name}
          </h1>

          <p className="text-sm opacity-90 sm:text-base leading-relaxed">
            Leading digital transformation and youth economic empowerment across the Republic of Botswana through competitive innovation challenges.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs opacity-90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} /> Verified CEDA Innovation Partner
            </span>
            <span>•</span>
            <span>{partner.instances.length} Active Challenges</span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div
          className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: secondaryColor }}
        />
      </div>

      <DemoDataBanner message="Demo data: fictional partner challenges for illustration" />

      {/* Challenge Instances Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-ceda-ink">Partner Innovation Challenges</h2>
            <p className="text-xs text-ceda-slate mt-0.5">
              Submit ideas, register youth teams, and compete for grants and pilot deployment contracts.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-ceda-slate">
            {partner.instances.length} Call(s)
          </span>
        </div>

        {partner.instances.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-xs text-ceda-slate">
            No public challenges currently open from this partner. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {partner.instances.map((inst) => {
              const def = inst.definition as any;
              const prizes = def?.meta?.prizes || [];
              const topPrize = prizes[0]?.amountPula;

              return (
                <div
                  key={inst.id}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        {def?.meta?.category || "Challenge"}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {inst.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-ceda-ink hover:text-ceda-orange transition">
                      <Link href={`/instances/${inst.slug}`}>{inst.name}</Link>
                    </h3>

                    <p className="text-xs text-ceda-slate line-clamp-3 leading-relaxed">
                      {def?.meta?.description}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-xs">
                      {topPrize ? (
                        <div className="flex items-center gap-1.5 font-bold text-ceda-copper">
                          <Trophy size={14} />
                          <span>P{topPrize.toLocaleString()} Top Prize</span>
                        </div>
                      ) : (
                        <span className="text-ceda-slate">{inst._count.entries} proposals</span>
                      )}

                      <span className="text-ceda-slate flex items-center gap-1">
                        <Calendar size={13} />
                        Closes {formatDate(inst.closesAt)}
                      </span>
                    </div>

                    <Link
                      href={`/instances/${inst.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ceda-sand py-2.5 text-xs font-bold text-ceda-copper hover:bg-ceda-copper hover:text-white transition"
                    >
                      <span>View Guidelines & Apply</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
