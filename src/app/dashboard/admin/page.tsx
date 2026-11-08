import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardCheck, Gavel, Inbox, Trophy, UserX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { actionLabel, JOURNEY } from "@/lib/labels";
import { cn, formatDate, formatPula, relativeDeadline, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const now = new Date();

  const [byStatus, awardSum, overdueEvals, conflicts, closing, activity, innovators] = await Promise.all([
    prisma.instance.groupBy({ by: ["status"], _count: true }),
    prisma.instance.aggregate({ where: { status: "AWARDED" }, _sum: { awardAmount: true } }),
    prisma.evaluation.findMany({
      where: { submittedAt: null, conflict: { not: true }, dueAt: { lt: now }, instance: { status: "UNDER_REVIEW" } },
      include: { evaluator: { select: { name: true } }, instance: { select: { id: true, referenceCode: true } } },
      orderBy: { dueAt: "asc" },
      take: 6,
    }),
    prisma.evaluation.findMany({
      where: { conflict: true, instance: { status: "UNDER_REVIEW" } },
      include: { evaluator: { select: { name: true } }, instance: { select: { id: true, referenceCode: true, title: true } } },
      take: 5,
    }),
    prisma.template.findMany({
      where: { status: "OPEN", closesAt: { gte: now } },
      orderBy: { closesAt: "asc" },
      take: 4,
      include: { _count: { select: { instances: true } }, instances: { where: { status: { not: "DRAFT" } }, select: { id: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } }, instance: { select: { id: true, referenceCode: true } } },
    }),
    prisma.user.count({ where: { role: "INNOVATOR" } }),
  ]);
  const c = (...s: string[]) => byStatus.filter((b) => s.includes(b.status)).reduce((a, b) => a + b._count, 0);
  const funnel = JOURNEY.map((j) => ({ label: j.label, value: c(...j.statuses) }));
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ceda-navy">Dumela, {user?.name?.split(" ")[0] ?? "there"}</h1>
        <p className="mt-1 text-muted-foreground">The innovation pipeline today: {c("SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "APPROVED", "FLAGGED", "AWARDED", "REJECTED")} ideas from {innovators} registered innovators.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard href="/dashboard/admin/instances?filter=screening" icon={<Inbox />} label="To screen" value={c("SUBMITTED")} tone="amber" />
        <StatCard href="/dashboard/admin/instances?filter=evaluation" icon={<ClipboardCheck />} label="Being scored" value={c("UNDER_REVIEW")} tone="blue" />
        <StatCard href="/dashboard/panel" icon={<Gavel />} label="With panel" value={c("SHORTLISTED", "APPROVED")} tone="purple" />
        <StatCard href="/dashboard/admin/instances?filter=changes" icon={<AlertTriangle />} label="Changes requested" value={c("FLAGGED")} tone="orange" />
        <StatCard href="/dashboard/reports" icon={<Trophy />} label="Awarded" value={formatPula(awardSum._sum.awardAmount ?? 0)} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 font-semibold text-ceda-navy">Where ideas are now</h2>
            <div className="space-y-2.5">
              {funnel.map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-muted-foreground">{f.label}</span>
                  <div className="h-6 flex-1 rounded bg-ceda-light">
                    <div className="flex h-6 items-center rounded bg-ceda-blue px-2 text-xs font-semibold text-white" style={{ width: `${Math.max(6, (f.value / maxFunnel) * 100)}%` }}>
                      {f.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Drafts not counted ({c("DRAFT")}). Approval includes ideas not selected ({c("REJECTED")}).</p>
          </section>

          <section className="rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-ceda-navy">Open calls</h2>
              <Link href="/dashboard/admin/calls" className="text-sm font-medium text-ceda-blue hover:underline">Manage calls</Link>
            </div>
            <ul className="divide-y divide-border">
              {closing.map((t) => {
                const d = relativeDeadline(t.closesAt);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono">{t.code}</span> · closes {formatDate(t.closesAt)}{" "}
                        <span className={cn(d.soon && "text-amber-700")}>({d.text.replace("due ", "")})</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="text-base font-bold text-ceda-navy">{t.instances.length}</p>
                      submitted · {t._count.instances - t.instances.length} drafts
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 font-semibold text-ceda-navy">Needs reassigning</h2>
            {conflicts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No evaluator has stepped aside.</p>
            ) : (
              <ul className="space-y-2">
                {conflicts.map((e) => (
                  <li key={e.id}>
                    <Link href={`/dashboard/admin/instances/${e.instance.id}`} className="flex items-start gap-2 text-sm hover:text-ceda-blue">
                      <UserX size={15} className="mt-0.5 shrink-0 text-gray-400" />
                      <span><span className="font-mono text-xs">{e.instance.referenceCode}</span> · {e.evaluator.name} declared a conflict</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 font-semibold text-ceda-navy">Overdue scorecards</h2>
            {overdueEvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">All evaluators are on time.</p>
            ) : (
              <ul className="space-y-2">
                {overdueEvals.map((e) => (
                  <li key={e.id}>
                    <Link href={`/dashboard/admin/instances/${e.instance.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-ceda-blue">
                      <span className="truncate">{e.evaluator.name} · <span className="font-mono text-xs">{e.instance.referenceCode}</span></span>
                      <span className="shrink-0 text-xs text-red-600">{relativeDeadline(e.dueAt).text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 font-semibold text-ceda-navy">Latest activity</h2>
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p>
                    <span className="font-medium">{a.actor.name}</span> <span className="text-muted-foreground">· {actionLabel(a.action).toLowerCase()}</span>
                    {a.instance && <span className="font-mono text-xs"> {a.instance.referenceCode}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ href, icon, label, value, tone }: { href: string; icon: React.ReactNode; label: string; value: number | string; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-ceda-blue bg-ceda-blue/10",
    amber: "text-amber-600 bg-amber-100",
    green: "text-ceda-green bg-ceda-green/10",
    orange: "text-ceda-orange bg-ceda-orange/10",
    purple: "text-purple-600 bg-purple-100",
  };
  return (
    <Link href={href} className="group rounded-xl border border-border bg-white p-4 transition-all hover:border-ceda-blue/30 hover:shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tones[tone]}`}>{icon}</div>
      <p className="text-2xl font-bold text-ceda-navy">{value}</p>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        {label} <ArrowRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
    </Link>
  );
}
