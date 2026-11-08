import Link from "next/link";
import type { InstanceStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/status-badge";
import { instanceStatusMeta } from "@/lib/labels";
import { cn, formatDate, relativeDeadline } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; statuses?: InstanceStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open", statuses: ["PENDING", "IN_PROGRESS"] },
  { key: "review", label: "Awaiting review", statuses: ["SUBMITTED"] },
  { key: "flagged", label: "Needs changes", statuses: ["FLAGGED"] },
  { key: "closed", label: "Closed", statuses: ["APPROVED", "REJECTED"] },
];

export default async function AdminInstancesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const active = FILTERS.find((f) => f.key === searchParams.filter) ?? FILTERS[0];
  const where: Prisma.InstanceWhereInput = active.statuses ? { status: { in: active.statuses } } : {};

  const [instances, counts] = await Promise.all([
    prisma.instance.findMany({
      where,
      select: {
        id: true,
        status: true,
        deadline: true,
        createdAt: true,
        submittedAt: true,
        template: { select: { name: true, code: true } },
        licensee: { select: { organizationName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.instance.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (statuses?: InstanceStatus[]) =>
    counts.filter((c) => !statuses || statuses.includes(c.status)).reduce((s, c) => s + c._count, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">All instances</h1>
          <p className="mt-1 text-muted-foreground">Every compliance instance issued to licensees</p>
        </div>
        <Link
          href="/dashboard/admin/provision"
          className="rounded-lg bg-bocra-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bocra-navy/90"
        >
          + Provision new
        </Link>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/dashboard/admin/instances" : `/dashboard/admin/instances?filter=${f.key}`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              f.key === active.key ? "border-bocra-navy bg-bocra-navy text-white" : "border-border bg-white hover:bg-bocra-light"
            )}
          >
            {f.label} <span className="opacity-60">{countFor(f.statuses)}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        {instances.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">No instances here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Template</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Licensee</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Deadline</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {instances.map((i) => {
                const d = relativeDeadline(i.deadline);
                const open = !["APPROVED", "REJECTED", "SUBMITTED"].includes(i.status);
                return (
                  <tr key={i.id} className="group hover:bg-bocra-light/60">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/admin/instances/${i.id}`} className="block">
                        <p className="font-medium text-bocra-navy group-hover:text-bocra-blue">{i.template.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{i.template.code}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-3">{i.licensee.organizationName}</td>
                    <td className="px-5 py-3">
                      <p className="text-muted-foreground">{formatDate(i.deadline)}</p>
                      {open && <p className={cn("text-xs", d.overdue ? "text-red-600" : "text-muted-foreground")}>{d.text}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Statuses: {Object.values(instanceStatusMeta).filter((m) => m.label !== "Draft").map((m) => m.label).join(" → ")}
      </p>
    </div>
  );
}
