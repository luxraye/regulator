import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { compileInstance } from "@/lib/instance-engine/compiler";
import { formatDate, cn } from "@/lib/utils";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  BarChart3,
  Sliders,
  ExternalLink,
  History,
  Lock,
} from "lucide-react";

interface ConsolePageProps {
  params: { id: string };
}

export const metadata = {
  title: "Instance Console | CEDA",
};

export default async function InstanceConsolePage({ params }: ConsolePageProps) {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN", "ADJUDICATOR"].includes(user.role)) {
    redirect("/dashboard");
  }

  const { id } = params;

  const instance = await prisma.instance.findUnique({
    where: { id },
    include: {
      partner: true,
      versions: {
        orderBy: { version: "desc" },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      },
      roles: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      entries: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          evaluations: {
            select: { id: true, total: true, submittedAt: true, evaluatorId: true },
          },
          checkResults: {
            select: { id: true, status: true, checkKey: true },
          },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { actor: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!instance) {
    notFound();
  }

  const definition = instance.definition as unknown as InstanceDefinition;
  const compiled = compileInstance(definition);

  const totalEntries = instance.entries.length;
  const eligibleEntries = instance.entries.filter((e) => e.status !== "REJECTED").length;
  const ineligibleEntries = instance.entries.filter((e) => e.status === "REJECTED").length;

  let checkFailures = 0;
  for (const e of instance.entries) {
    checkFailures += e.checkResults.filter((c) => c.status === "FAIL").length;
  }

  const allEvaluations = instance.entries.flatMap((e) => e.evaluations);
  const completedEvaluations = allEvaluations.filter((ev) => ev.submittedAt !== null);
  const evalProgressPercent = allEvaluations.length > 0 ? Math.round((completedEvaluations.length / allEvaluations.length) * 100) : 0;

  // Judge Variance Flagging
  const varianceThreshold = definition.rubric?.disagreementThreshold ?? 20;
  const varianceFlags: { entryId: string; title: string; minScore: number; maxScore: number; diff: number; scores: number[] }[] = [];

  for (const e of instance.entries) {
    const scores = e.evaluations.filter((ev) => ev.submittedAt !== null && ev.total != null).map((ev) => ev.total as number);
    if (scores.length >= 2) {
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const diff = max - min;
      if (diff >= varianceThreshold) {
        varianceFlags.push({ entryId: e.id, title: e.title, minScore: min, maxScore: max, diff, scores });
      }
    }
  }

  const consensusRequired = varianceFlags.length > 0;
  const currentStage = compiled.currentStage;

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <Link href="/dashboard/instances" className="hover:text-ceda-ink transition">
              ← Instances
            </Link>
            <span>•</span>
            <span className="font-medium text-ceda-copper">{instance.partner?.name ?? "CEDA"}</span>
            <span>•</span>
            <span className="font-mono">{instance.slug}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            {instance.name}
          </h1>
          <p className="text-xs text-ceda-slate">
            Instance Console: Real-time oversight, stage countdown, scoring variance, and audit verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/instances/${instance.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
          >
            <Sliders size={14} className="text-ceda-copper" />
            Edit in Studio
          </Link>
          <Link
            href={`/instances/${instance.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ceda-copper transition"
          >
            <span>Public Portal</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Rules Fingerprint Banner */}
      {instance.rulesHash && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Sealed & Verifiable Ruleset:</span>{" "}
              <code className="font-mono text-emerald-800 break-all">{instance.rulesHash}</code>
            </div>
          </div>
          <Link
            href={`/api/instances-public/${instance.slug}/verify`}
            target="_blank"
            className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition"
          >
            Verify Integrity <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Active Stage & Countdown */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ceda-orange">Current Phase</span>
            <h2 className="text-xl font-bold text-ceda-ink">
              {currentStage ? currentStage.name : "Between Scheduled Stages"}
            </h2>
          </div>
          {currentStage && (
            <div className="flex items-center gap-2 rounded-lg bg-ceda-sand px-3 py-1.5 border border-ceda-copper/20">
              <Clock size={16} className="text-ceda-copper animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-ceda-copper">
                  {Math.floor(currentStage.timeRemainingMs / 86400000)}d{" "}
                  {Math.floor((currentStage.timeRemainingMs % 86400000) / 3600000)}h remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stage Timeline Steps */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 pt-2">
          {compiled.stages.map((stg, idx) => {
            const isCurrent = stg.isCurrent;
            const isPast = stg.status === "PAST";

            return (
              <div
                key={stg.id || idx}
                className={cn(
                  "rounded-lg p-2.5 text-xs border transition",
                  isCurrent
                    ? "border-ceda-orange bg-orange-50 font-semibold"
                    : isPast
                    ? "border-emerald-200 bg-emerald-50/50 text-ceda-slate"
                    : "border-border bg-slate-50 text-ceda-slate"
                )}
              >
                <div className="flex items-center justify-between text-[10px] uppercase">
                  <span>Step {idx + 1}</span>
                  {isPast && <CheckCircle2 size={12} className="text-emerald-600" />}
                  {isCurrent && <span className="text-ceda-orange font-bold">● Active</span>}
                </div>
                <div className="font-bold text-ceda-ink mt-1 truncate" title={stg.name}>
                  {stg.name}
                </div>
                <div className="text-[10px] text-ceda-slate mt-0.5 truncate">
                  {formatDate(stg.end)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oversight KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Users size={14} className="text-ceda-copper" />
            Total Registrations
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{totalEntries}</div>
          <div className="mt-1 text-[11px] text-ceda-slate">
            {eligibleEntries} Eligible / {ineligibleEntries} Ineligible
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <ShieldCheck size={14} className="text-emerald-600" />
            Guard Failures
          </div>
          <div className={cn("mt-2 text-2xl font-bold", checkFailures > 0 ? "text-rose-600" : "text-emerald-700")}>
            {checkFailures}
          </div>
          <div className="mt-1 text-[11px] text-ceda-slate">Pre-flight checks passed</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <BarChart3 size={14} className="text-ceda-orange" />
            Reviewer Progress
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{evalProgressPercent}%</div>
          <div className="mt-1 text-[11px] text-ceda-slate">
            {completedEvaluations.length} of {allEvaluations.length} reviews complete
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <AlertTriangle size={14} className={varianceFlags.length > 0 ? "text-rose-600" : "text-emerald-600"} />
            Score Discrepancies
          </div>
          <div className={cn("mt-2 text-2xl font-bold", varianceFlags.length > 0 ? "text-rose-700" : "text-ceda-ink")}>
            {varianceFlags.length}
          </div>
          <div className="mt-1 text-[11px] text-ceda-slate">
            {consensusRequired ? "Consensus review required" : "Consensus reached"}
          </div>
        </div>
      </div>

      {/* Variance Flags & Consensus Panel */}
      {varianceFlags.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-700" />
              <h2 className="text-sm font-bold text-rose-950">
                Judge Variance Flags ({varianceFlags.length} Entries Require Consensus)
              </h2>
            </div>
            <span className="rounded bg-rose-200 px-2 py-0.5 text-xs font-bold text-rose-800">
              Threshold: &gt;={varianceThreshold} pts
            </span>
          </div>
          <p className="text-xs text-rose-800">
            The following proposals have divergent evaluator marks exceeding the defined variance tolerance threshold. An adjudicator consensus session is required prior to shortlisting.
          </p>

          <div className="space-y-2">
            {varianceFlags.map((v) => (
              <div key={v.entryId} className="flex items-center justify-between rounded-lg bg-white p-3 border border-rose-200 text-xs">
                <div>
                  <span className="font-bold text-ceda-ink">{v.title}</span>
                  <span className="ml-2 font-mono text-ceda-slate">({v.entryId})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ceda-slate">
                    Scores: <code className="font-bold text-ceda-ink">{v.scores.join(", ")}</code>
                  </span>
                  <span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                    Δ {v.diff} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Version History & Audit Trail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Version History */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-ceda-orange" />
              <h2 className="text-base font-bold text-ceda-ink">Ruleset Version History</h2>
            </div>
            <span className="text-xs font-semibold text-ceda-slate">
              {instance.versions.length} Version(s)
            </span>
          </div>

          <div className="space-y-3">
            {instance.versions.map((ver) => (
              <div key={ver.id} className="rounded-lg border border-border bg-slate-50 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ceda-ink">Version {ver.version}</span>
                  <span className="text-ceda-slate">{formatDate(ver.createdAt)}</span>
                </div>
                <p className="text-ceda-slate">{ver.reason}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>{ver.rulesHash.slice(0, 16)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-ceda-copper" />
              <h2 className="text-base font-bold text-ceda-ink">Tamper-Evident Audit Trail</h2>
            </div>
            <span className="text-xs font-semibold text-ceda-slate">Recent Events</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
            {instance.auditLogs.length === 0 ? (
              <p className="text-ceda-slate text-center py-6">No audit records logged yet.</p>
            ) : (
              instance.auditLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-border bg-slate-50 p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ceda-ink">{log.action}</span>
                    <span className="text-[11px] text-ceda-slate">{formatDate(log.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ceda-slate">
                    <span>Actor: {log.actor?.name || "System"}</span>
                    {log.hash && <code className="font-mono text-[10px]">{log.hash.slice(0, 10)}...</code>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
