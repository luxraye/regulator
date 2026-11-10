import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";
import { actionLabel } from "@/lib/labels";
import { verifyAuditChain } from "@/lib/audit";
import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditTrailPage({ searchParams }: { searchParams: { action?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.AuditLogWhereInput = searchParams.action ? { action: searchParams.action } : {};

  const [entries, total, actions, chainStatus] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        actor: { select: { name: true, email: true, role: true } },
        entry: { select: { id: true, referenceCode: true, template: { select: { code: true } }, innovator: { select: { organizationName: true } } } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: true, orderBy: { action: "asc" } }),
    verifyAuditChain(),
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
        <h1 className="text-2xl font-bold text-ceda-ink">Audit Trail & Cryptographic Chain</h1>
        <p className="mt-1 text-muted-foreground">
          Append-only, SHA-256 hash-chained record of every submission, score, decision, and administrator mutation. {total} total events.
        </p>
      </div>

      {/* Cryptographic Hash Chain Verification Banner */}
      <div
        className={cn(
          "mb-6 rounded-xl border p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm",
          chainStatus.valid
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
        )}
      >
        <div className="flex items-center gap-3">
          {chainStatus.valid ? (
            <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert size={22} className="text-rose-600 shrink-0" />
          )}
          <div>
            <p className="font-bold text-sm">
              {chainStatus.valid ? "Hash Chain Cryptographically Verified" : "Chain Integrity Breach Detected!"}
            </p>
            <p className="text-[11px] opacity-90 mt-0.5">{chainStatus.details}</p>
          </div>
        </div>

        {chainStatus.tipHash && (
          <div className="flex items-center gap-2 rounded-lg bg-white/80 border border-current/20 px-3 py-1 font-mono text-[11px]">
            <Lock size={12} className="shrink-0 text-ceda-orange" />
            <span>Chain Tip: {chainStatus.tipHash.slice(0, 16)}...</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/dashboard/superadmin/audit"
          className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", !searchParams.action ? "border-ceda-ink bg-ceda-ink text-white" : "border-border bg-white")}
        >
          All
        </Link>
        {actions.map((a) => (
          <Link
            key={a.action}
            href={`/dashboard/superadmin/audit?action=${a.action}`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium",
              searchParams.action === a.action ? "border-ceda-ink bg-ceda-ink text-white" : "border-border bg-white hover:bg-ceda-sand"
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
              <th className="px-5 py-3 font-medium text-muted-foreground">Hash Fingerprint</th>
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
                <td className="px-5 py-3 text-xs">
                  <span className="font-medium">{actionLabel(e.action)}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground">{e.action}</span>
                </td>
                <td className="px-5 py-3">
                  {e.entry ? (
                    <Link href={`/dashboard/admin/instances/${e.entry.id}`} className="text-ceda-orange hover:underline">
                      {e.entry.referenceCode} · {e.entry.innovator.organizationName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="max-w-xs px-5 py-3 font-mono text-[11px] text-muted-foreground">
                  {e.hash ? (
                    <span title={`Hash: ${e.hash}\nPrev: ${e.prevHash || "GENESIS"}`}>
                      {e.hash.slice(0, 16)}...
                    </span>
                  ) : (
                    <span className="text-slate-400">Legacy record</span>
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
            {page > 1 && <Link href={qs({ page: page - 1 })} className="rounded-lg border border-border bg-white px-3 py-1.5 hover:bg-ceda-sand">Newer</Link>}
            {page < pages && <Link href={qs({ page: page + 1 })} className="rounded-lg border border-border bg-white px-3 py-1.5 hover:bg-ceda-sand">Older</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
