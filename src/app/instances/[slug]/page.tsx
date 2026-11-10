import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { compileInstance } from "@/lib/instance-engine/compiler";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import { computeLeaderboard } from "@/lib/instance-engine/leaderboard";
import { formatDate } from "@/lib/utils";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Trophy,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { PublicRuleVerifier } from "./verifier-client";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;
  if (slug === "ceda-hackathon-2026") {
    await ensureFlagshipInstance(prisma);
  }
  const instance = await prisma.instance.findUnique({ where: { slug } });
  return {
    title: `${instance?.name || "Competition"} | CEDA Innovation Portal`,
    description: (instance?.definition as any)?.meta?.description || "CEDA challenge details.",
  };
}

export default async function PublicInstanceDetailPage({ params }: PageProps) {
  const { slug } = params;

  if (slug === "ceda-hackathon-2026") {
    await ensureFlagshipInstance(prisma);
  }

  const instance = await prisma.instance.findUnique({
    where: { slug },
    include: {
      partner: true,
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!instance) {
    notFound();
  }

  const definition = instance.definition as unknown as InstanceDefinition;
  const compiled = compileInstance(definition);
  const currentStage = compiled.currentStage;
  const prizes = definition.meta?.prizes || [];
  const totalPrizePool = prizes.reduce((sum, p) => sum + (p.amountPula || 0), 0);
  const leaderboard = await computeLeaderboard(instance.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-ceda-slate">
        <Link href="/instances" className="hover:text-ceda-ink transition">
          ← All Competitions
        </Link>
        <span>•</span>
        <span className="font-semibold text-ceda-copper">{instance.partner?.name ?? "CEDA"}</span>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-ceda-copper">
            {definition.meta?.category || "National Challenge"}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            {instance.status}
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ceda-ink sm:text-4xl">
            {instance.name}
          </h1>
          <p className="mt-3 text-sm text-ceda-slate sm:text-base leading-relaxed">
            {definition.meta?.description}
          </p>
        </div>

        {/* Live Stage Countdown Banner */}
        {currentStage && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-ceda-sand via-orange-50 to-ceda-sand p-4 border border-ceda-copper/20">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-ceda-orange p-2.5 text-white">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ceda-copper">
                  Active Stage
                </span>
                <h3 className="text-base font-bold text-ceda-ink">{currentStage.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-ceda-slate block">Closing Date</span>
              <span className="font-bold text-ceda-copper text-sm">
                {formatDate(currentStage.end)} (
                {Math.floor(currentStage.timeRemainingMs / 86400000)}d{" "}
                {Math.floor((currentStage.timeRemainingMs % 86400000) / 3600000)}h left)
              </span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-ceda-orange px-6 py-3 text-sm font-bold text-white shadow hover:bg-ceda-copper transition"
          >
            <span>Register & Apply</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-ceda-ink hover:bg-slate-50 transition"
          >
            Sign In to Existing Dossier
          </Link>
        </div>
      </div>

      {/* Interactive Rules Verification Tool */}
      <PublicRuleVerifier
        slug={instance.slug}
        sealedRulesHash={instance.rulesHash}
        version={instance.versions[0]?.version ?? 1}
      />

      {/* Prize Structure */}
      {prizes.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-ceda-orange" />
              <h2 className="text-lg font-bold text-ceda-ink">Prize Pool & Grants</h2>
            </div>
            {totalPrizePool > 0 && (
              <span className="rounded-full bg-ceda-sand px-3 py-1 text-xs font-bold text-ceda-copper">
                Total Pool: P{totalPrizePool.toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prizes.map((pz, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-slate-50 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-ceda-slate">#{pz.rank}</span>
                  {pz.amountPula && (
                    <span className="text-base font-extrabold text-ceda-copper">
                      P{pz.amountPula.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-ceda-ink">{pz.title}</div>
                {pz.rewardText && <p className="text-xs text-ceda-slate mt-1">{pz.rewardText}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Timeline */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Calendar size={20} className="text-ceda-orange" />
          <h2 className="text-lg font-bold text-ceda-ink">Stage Timeline & Progression Gates</h2>
        </div>

        <div className="space-y-3">
          {compiled.stages.map((stg, idx) => (
            <div
              key={stg.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="rounded-full bg-ceda-ink px-2.5 py-0.5 text-xs font-bold text-white mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-ceda-ink">{stg.name}</h3>
                  {stg.description && <p className="text-xs text-ceda-slate mt-0.5">{stg.description}</p>}
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-ceda-slate">
                <span className="font-medium text-ceda-ink block">
                  {formatDate(stg.start)} – {formatDate(stg.end)}
                </span>
                <span className="text-[11px] uppercase text-ceda-copper font-semibold">
                  Gate: {stg.gate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Rubric Breakdown */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-ceda-orange" />
            <h2 className="text-lg font-bold text-ceda-ink">Scoring Rubric (100% Weighting)</h2>
          </div>
          <span className="text-xs font-semibold text-ceda-slate">
            Blind Peer Review: {definition.rubric?.blind ? "Enabled" : "Standard"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(definition.rubric?.criteria ?? []).map((crit) => (
            <div key={crit.key} className="rounded-xl border border-border bg-slate-50 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-ceda-ink">{crit.label}</h3>
                <span className="rounded-full bg-ceda-orange px-2 py-0.5 text-xs font-bold text-white">
                  {crit.weight}%
                </span>
              </div>
              {crit.guide && <p className="text-xs text-ceda-slate leading-relaxed">{crit.guide}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Reproducible Leaderboard & Standings */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-ceda-orange" />
              <h2 className="text-lg font-bold text-ceda-ink">Live Competition Standings & Leaderboard</h2>
            </div>
            <Link
              href={`/api/instances-public/${instance.slug}/leaderboard`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ceda-copper hover:underline"
            >
              <span>Raw JSON & Proof</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs border border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span className="text-ceda-slate">
                Reproducible Fingerprint:{" "}
                <code className="font-mono font-bold text-ceda-ink">{leaderboard.leaderboardHash.slice(0, 16)}...</code>
              </span>
            </div>
            <span className="text-[11px] text-ceda-slate">
              {leaderboard.evaluatedEntriesCount} evaluated proposals • Mathematically verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-ceda-slate border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Rank</th>
                  <th className="px-4 py-2.5 font-semibold">Project & Organization</th>
                  <th className="px-4 py-2.5 font-semibold">Dossier Code</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Mean Score</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Reviewers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.entries.map((entry) => (
                  <tr key={entry.entryId} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 w-6 h-6 text-xs">
                          🥇
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-800 w-6 h-6 text-xs">
                          🥈
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-800 w-6 h-6 text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-ceda-slate">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-ceda-ink text-sm">{entry.title}</div>
                      <div className="text-xs text-ceda-slate">{entry.organizationName}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-ceda-copper font-medium">
                      {entry.referenceCode}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-lg bg-ceda-sand px-2.5 py-1 font-bold text-ceda-copper">
                        {entry.meanScore} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-ceda-slate">
                      {entry.reviewerCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      {definition.channels?.faqs && definition.channels.faqs.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <HelpCircle size={20} className="text-ceda-copper" />
            <h2 className="text-lg font-bold text-ceda-ink">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {definition.channels.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-slate-50 p-4 space-y-1 text-xs">
                <h3 className="font-bold text-sm text-ceda-ink">{faq.q}</h3>
                <p className="text-ceda-slate leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
