import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";
import { actionLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditTrailPage({ searchParams }: { searchParams: { action?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.AuditLogWhereInput = searchParams.action ? { action: searchParams.action } : {};

  const [entries, total, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        actor: { select: { name: true, email: true, role: true } },
        instance: { select: { id: true, referenceCode: true, template: { select: { code: true } }, innovator: { select: { organizationName: true } } } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: true, orderBy: { action: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: Record<string, string | number | undefined>) => {
    const s = new URLSearchParams();
    Object.entries({ action: searchParams.action, ...p }).forEach(([k, v]) => v && s.set(k, String(v)));
    return `?${s}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-navy">Audit trail</h1>
        <p className="mt-1 text-muted-foreground">
          Append-only record of every submission, assignment, conflict declaration, score, decision, download and admin change. {total} entries.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/dashboard/superadmin/audit"
          className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", !searchParams.action ? "border-ceda-navy bg-ceda-navy text-white" : "border-border bg-white")}
        >
          All
        </Link>
        {actions.map((a) => (
          <Link
            key={a.action}
            href={`/dashboard/superadmin/audit?action=${a.action}`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium",
              searchParams.action === a.action ? "border-ceda-navy bg-ceda-navy text-white" : "border-border bg-white hover:bg-ceda-light"
            )}
          >
            {actionLabel(a.action)} <span className="opacity-60">{a._count}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">When</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Who</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Action</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Subject</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id} className="align-top">
                <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDate(e.createdAt, true)}</td>
                <td className="px-5 py-3">
                  <p className="font-medium">{e.actor.name}</p>
                  <p className="text-xs text-muted-foreground">{e.actor.role.toLowerCase()}</p>
                </td>
                <td className="px-5 py-3 text-xs"><span className="font-medium">{actionLabel(e.action)}</span><span className="block font-mono text-[10px] text-muted-foreground">{e.action}</span></td>
                <td className="px-5 py-3">
                  {e.instance ? (
                    <Link href={`/dashboard/admin/instances/${e.instance.id}`} className="text-ceda-blue hover:underline">
                      {e.instance.referenceCode} · {e.instance.innovator.organizationName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="max-w-xs px-5 py-3">
                  {e.metadata ? (
                    <code className="block truncate text-xs text-muted-foreground" title={JSON.stringify(e.metadata)}>
                      {JSON.stringify(e.metadata)}
                    </code>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="py-12 text-center text-muted-foreground">No entries.</p>}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="rounded-lg border border-border bg-white px-3 py-1.5 hover:bg-ceda-light">Newer</Link>}
            {page < pages && <Link href={qs({ page: page + 1 })} className="rounded-lg border border-border bg-white px-3 py-1.5 hover:bg-ceda-light">Older</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
