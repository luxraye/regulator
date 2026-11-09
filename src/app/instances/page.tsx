import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Competitions & Challenges | CEDA Innovation Portal",
  description: "Browse open citizen youth innovation challenges, grant calls, and hackathons.",
};

export default async function PublicInstancesDirectoryPage() {
  await ensureFlagshipInstance(prisma);

  const instances = await prisma.instance.findMany({
    where: {
      status: { in: ["PUBLISHED", "LIVE", "CLOSED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      partner: true,
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
      _count: { select: { entries: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Hero section */}
      <div className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
          <Sparkles size={14} /> Programmable & Tamper-Evident Challenges
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ceda-ink sm:text-5xl">
          CEDA Innovation Challenges
        </h1>
        <p className="max-w-3xl text-base text-ceda-slate sm:text-lg">
          Participate in national funding calls, software hackathons, and sector accelerators. Every competition runs on verifiable, mathematically sealed evaluation rulesets.
        </p>
      </div>

      {/* Instance Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instances.map((inst) => {
          const def = inst.definition as any;
          const prizes = def?.meta?.prizes || [];
          const totalPrizePula = prizes.reduce((sum: number, p: any) => sum + (p.amountPula || 0), 0);
          const stages = def?.timeline || [];

          return (
            <div
              key={inst.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="space-y-4">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-ceda-sand px-2.5 py-0.5 text-xs font-semibold text-ceda-copper">
                    {inst.partner?.name ?? "CEDA"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {inst.status}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h2 className="text-lg font-bold text-ceda-ink line-clamp-2">
                    <Link href={`/instances/${inst.slug}`} className="hover:text-ceda-orange transition">
                      {inst.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-xs text-ceda-slate line-clamp-3">
                    {def?.meta?.description || "National innovation challenge."}
                  </p>
                </div>

                {/* Key Numbers */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ceda-slate block">Prize Pool</span>
                    <span className="font-bold text-ceda-copper text-sm">
                      {totalPrizePula > 0 ? `P${totalPrizePula.toLocaleString()}` : "CEDA Grants"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ceda-slate block">Timeline</span>
                    <span className="font-medium text-ceda-ink">{stages.length} Stages</span>
                  </div>
                </div>

                {/* Rules Fingerprint */}
                {inst.rulesHash && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-ceda-slate">
                    <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Hash: {inst.rulesHash.slice(0, 16)}...</span>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                <span className="text-xs text-ceda-slate">Closes: {formatDate(inst.closesAt)}</span>
                <Link
                  href={`/instances/${inst.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-ceda-copper transition"
                >
                  <span>Explore</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
