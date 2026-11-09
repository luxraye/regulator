import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, FileBox, Megaphone, ShieldCheck, Trophy, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { checkEligibility } from "@/lib/eligibility";
import { StatusBadge } from "@/components/ui/status-badge";
import { JourneyTracker, statusExplainer } from "@/components/ideas/journey-tracker";
import { CallCard } from "@/components/ideas/call-card";
import { cn, formatPula } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InnovatorDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const now = new Date();

  const [ideas, profile, calls] = await Promise.all([
    prisma.entry.findMany({
      where: { innovatorId: user.id },
      select: { id: true, title: true, referenceCode: true, status: true, reviewNotes: true, awardAmount: true, template: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.template.findMany({
      where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } },
      orderBy: { closesAt: "asc" },
      take: 3,
    }),
  ]);
  const elig = checkEligibility({
    omang: profile?.omang,
    dateOfBirth: profile?.dateOfBirth,
    youthShareholding: profile?.youthShareholding,
    hasCompany: !!profile?.licenseNumber,
  });

  const count = (...s: string[]) => ideas.filter((i) => s.includes(i.status)).length;
  const awarded = ideas.filter((i) => i.status === "AWARDED").reduce((a, i) => a + (i.awardAmount ?? 0), 0);
  const needsYou = ideas.filter((i) => ["DRAFT", "FLAGGED"].includes(i.status));
  const appliedCallIds = new Set(ideas.map((i) => i.template?.id).filter(Boolean));
  const freshCalls = calls.filter((c) => !appliedCallIds.has(c.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ceda-ink">Dumela, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted-foreground">{profile?.organizationName ?? "Innovator"} · {profile?.district ?? "Botswana"}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<FileBox />} label="Ideas" value={ideas.length} tone="blue" />
        <Stat icon={<AlertTriangle />} label="Need your action" value={needsYou.length} tone="orange" />
        <Stat icon={<CheckCircle2 />} label="In review" value={count("SUBMITTED", "UNDER_REVIEW", "SHORTLISTED")} tone="amber" />
        <Stat icon={<Trophy />} label="Awarded" value={awarded ? formatPula(awarded) : "—"} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {needsYou.length > 0 && (
            <section className="rounded-xl border border-orange-200 bg-orange-50/60">
              <h2 className="border-b border-orange-200 px-5 py-3 font-semibold text-ceda-ink">Needs your action</h2>
              <ul className="divide-y divide-orange-100">
                {needsYou.map((i) => (
                  <li key={i.id}>
                    <Link href={`/dashboard/innovator/instance-runner/${i.id}`} className="group flex items-center justify-between gap-3 px-5 py-3 hover:bg-orange-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {i.status === "FLAGGED" && i.reviewNotes ? `CEDA: ${i.reviewNotes}` : "Draft: finish and submit before the call closes"}
                        </p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-ceda-ink">Track my ideas</h2>
              <Link href="/dashboard/innovator/instances" className="text-sm font-medium text-ceda-orange hover:underline">All ideas</Link>
            </div>
            {ideas.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Megaphone className="mx-auto mb-2 text-ceda-orange" />
                <p className="font-medium text-ceda-ink">No applications yet</p>
                <p className="text-sm text-muted-foreground">Pick an open call below to submit your first idea.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {ideas.slice(0, 5).map((i) => (
                  <li key={i.id}>
                    <Link href={`/dashboard/innovator/instance-runner/${i.id}`} className="block px-5 py-4 hover:bg-ceda-sand/60">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{i.title}</p>
                          <p className="text-xs text-muted-foreground"><span className="font-mono">{i.referenceCode}</span> · {i.template?.name ?? "CEDA Innovation Call"}</p>
                        </div>
                        <StatusBadge status={i.status} />
                      </div>
                      <JourneyTracker status={i.status} compact />
                      <p className="mt-2 text-xs text-muted-foreground">{statusExplainer(i.status)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-1 flex items-center gap-2 font-semibold text-ceda-ink">
              <ShieldCheck size={18} className={elig.eligible ? "text-ceda-green" : "text-amber-600"} /> Eligibility
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">Checked from your profile against the competition rules.</p>
            <ul className="space-y-2">
              {elig.checks.map((c) => (
                <li key={c.key} className="flex items-start gap-2 text-sm">
                  {c.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ceda-green" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
                  <span>
                    {c.label}
                    <span className={cn("block text-xs", c.ok ? "text-muted-foreground" : "text-red-600")}>{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {freshCalls.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ceda-ink">Open calls you haven&apos;t applied to</h2>
            <Link href="/dashboard/innovator/calls" className="text-sm font-medium text-ceda-orange hover:underline">All calls</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {freshCalls.map((c) => (
              <CallCard
                key={c.id}
                call={c}
                action={
                  <Link href="/dashboard/innovator/calls" className="inline-flex items-center gap-1 text-sm font-medium text-ceda-orange hover:underline">
                    View and apply <ArrowRight size={14} />
                  </Link>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-ceda-orange bg-ceda-orange/10",
    amber: "text-amber-600 bg-amber-100",
    green: "text-ceda-green bg-ceda-green/10",
    orange: "text-ceda-orange bg-ceda-orange/10",
  };
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tones[tone]}`}>{icon}</div>
      <p className="text-2xl font-bold text-ceda-ink">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
