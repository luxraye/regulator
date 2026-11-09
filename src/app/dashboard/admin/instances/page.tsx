import Link from "next/link";
import type { InstanceStatus, Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; statuses?: InstanceStatus[] }[] = [
  { key: "screening", label: "Screening", statuses: ["SUBMITTED"] },
  { key: "evaluation", label: "Under evaluation", statuses: ["UNDER_REVIEW"] },
  { key: "panel", label: "With panel", statuses: ["SHORTLISTED", "APPROVED"] },
  { key: "changes", label: "Changes requested", statuses: ["FLAGGED"] },
  { key: "decided", label: "Decided", statuses: ["AWARDED", "REJECTED"] },
  { key: "drafts", label: "Drafts", statuses: ["DRAFT"] },
  { key: "all", label: "All" },
];

export default async function AdminIdeasPage({ searchParams }: { searchParams: { filter?: string; call?: string; q?: string } }) {
  const active = FILTERS.find((f) => f.key === (searchParams.filter ?? "screening")) ?? FILTERS[0];
  const q = searchParams.q?.trim();
  const calls = await prisma.template.findMany({ select: { id: true, code: true }, orderBy: { code: "asc" } });
  const call = calls.find((c) => c.code === searchParams.call);

  const base: Prisma.InstanceWhereInput = {
    ...(call ? { templateId: call.id } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { referenceCode: { contains: q, mode: "insensitive" } },
            { innovator: { organizationName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const where: Prisma.InstanceWhereInput = { ...base, ...(active.statuses ? { status: { in: active.statuses } } : {}) };

  const [ideas, counts] = await Promise.all([
    prisma.instance.findMany({
      where,
      select: {
        id: true, title: true, referenceCode: true, status: true, createdAt: true, submittedAt: true, submissionCount: true,
        template: { select: { code: true, reviewersPerIdea: true } },
        innovator: { select: { organizationName: true, district: true } },
        evaluations: { select: { submittedAt: true, conflict: true } },
      },
      orderBy: [{ submittedAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.instance.groupBy({ by: ["status"], where: base, _count: true }),
  ]);
  const countFor = (statuses?: InstanceStatus[]) =>
    counts.filter((c) => !statuses || statuses.includes(c.status)).reduce((s, c) => s + c._count, 0);
  const qs = (p: Record<string, string | undefined>) => {
    const s = new URLSearchParams();
    Object.entries({ filter: active.key, call: call?.code, q, ...p }).forEach(([k, v]) => v && s.set(k, v));
    return `/dashboard/admin/instances?${s}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-navy">Ideas &amp; screening</h1>
        <p className="mt-1 text-muted-foreground">Screen new submissions, assign evaluators, and follow every idea to a decision. Oldest first.</p>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/dashboard/admin/instances">
        <input type="hidden" name="filter" value={active.key} />
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={q} placeholder="Search title, reference or company" aria-label="Search title, reference or company" className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm" />
        </div>
        <select name="call" defaultValue={call?.code ?? ""} className="rounded-lg border border-border bg-white px-3 py-2 text-sm" aria-label="Call">
          <option value="">All calls</option>
          {calls.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
        </select>
        <button className="rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white">Filter</button>
      </form>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={qs({ filter: f.key })}
            className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", active.key === f.key ? "border-ceda-navy bg-ceda-navy text-white" : "border-border bg-white hover:bg-ceda-light")}
          >
            {f.label} <span className="opacity-60">{countFor(f.statuses)}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {ideas.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">No ideas here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {ideas.map((i) => {
              const active = i.evaluations.filter((e) => e.conflict !== true);
              const scored = active.filter((e) => e.submittedAt).length;
              const href = i.status === "DRAFT" ? null : `/dashboard/admin/instances/${i.id}`;
              const body = (
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{i.referenceCode}</span> · {i.template.code} · {i.innovator.organizationName ?? "—"} · {i.innovator.district ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {i.status === "UNDER_REVIEW" && <span>{scored}/{active.length || i.template.reviewersPerIdea} scored</span>}
                    {i.submissionCount > 1 && <span className="rounded bg-orange-50 px-1.5 py-0.5 text-orange-700">resubmitted</span>}
                    <span>{i.submittedAt ? formatDate(i.submittedAt) : `started ${formatDate(i.createdAt)}`}</span>
                    <StatusBadge status={i.status} />
                  </div>
                </div>
              );
              return <li key={i.id}>{href ? <Link href={href} className="block hover:bg-ceda-light/60">{body}</Link> : body}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
