import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardCheck, FileBox, MessageSquareWarning, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, relativeDeadline, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const now = new Date();

  const [total, licensees, awaiting, flagged, openComplaints, overdue, recent, activity] = await Promise.all([
    prisma.instance.count(),
    prisma.user.count({ where: { role: "INNOVATOR" } }),
    prisma.instance.count({ where: { status: "SUBMITTED" } }),
    prisma.instance.count({ where: { status: { in: ["FLAGGED", "REJECTED"] } } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.instance.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS", "FLAGGED"] }, deadline: { lt: now } },
      select: { id: true, deadline: true, template: { select: { code: true } }, innovator: { select: { organizationName: true } } },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    prisma.instance.findMany({
      select: { id: true, status: true, deadline: true, template: { select: { name: true, code: true } }, innovator: { select: { organizationName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { actor: { select: { name: true } }, instance: { select: { template: { select: { code: true } } } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bocra-navy">Dumela, {user?.name?.split(" ")[0] ?? "there"}</h1>
        <p className="mt-1 text-muted-foreground">Here is what needs attention across regulated operators today.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard href="/dashboard/admin/review" icon={<ClipboardCheck />} label="Awaiting review" value={awaiting} tone="amber" />
        <StatCard href="/dashboard/admin/complaints" icon={<MessageSquareWarning />} label="Open complaints" value={openComplaints} tone="orange" />
        <StatCard href="/dashboard/admin/instances?filter=flagged" icon={<AlertTriangle />} label="Flagged / rejected" value={flagged} tone="red" />
        <StatCard href="/dashboard/admin/instances" icon={<FileBox />} label="Total instances" value={total} tone="blue" />
        <StatCard href="/dashboard/admin/provision" icon={<Users />} label="Licensees" value={licensees} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-bocra-navy">Recent instances</h2>
            <Link href="/dashboard/admin/instances" className="text-sm font-medium text-bocra-blue hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-muted-foreground">No instances provisioned yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((i) => (
                <li key={i.id}>
                  <Link href={`/dashboard/admin/instances/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-bocra-light/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.innovator.organizationName} · due {formatDate(i.deadline)}
                      </p>
                    </div>
                    <StatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 font-semibold text-bocra-navy">Overdue</h2>
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue instances.</p>
            ) : (
              <ul className="space-y-2">
                {overdue.map((o) => (
                  <li key={o.id}>
                    <Link href={`/dashboard/admin/instances/${o.id}`} className="flex items-center justify-between text-sm hover:text-bocra-blue">
                      <span className="truncate">
                        {o.innovator.organizationName} · <span className="font-mono text-xs">{o.template.code}</span>
                      </span>
                      <span className="shrink-0 text-xs text-red-600">{relativeDeadline(o.deadline).text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 font-semibold text-bocra-navy">Latest activity</h2>
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p>
                    <span className="font-medium">{a.actor.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action.replace(/^INSTANCE_/, "").replace(/_/g, " ").toLowerCase()}</span>
                    {a.instance && <span className="font-mono text-xs"> {a.instance.template.code}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ href, icon, label, value, tone }: { href: string; icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-bocra-blue bg-bocra-blue/10",
    amber: "text-amber-600 bg-amber-100",
    green: "text-bocra-green bg-bocra-green/10",
    orange: "text-bocra-orange bg-bocra-orange/10",
    red: "text-red-600 bg-red-100",
  };
  return (
    <Link href={href} className="group rounded-xl border border-border bg-white p-4 transition-all hover:border-bocra-blue/30 hover:shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tones[tone]}`}>{icon}</div>
      <p className="text-2xl font-bold text-bocra-navy">{value}</p>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        {label} <ArrowRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
    </Link>
  );
}
