import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { fieldsToRecord, schemaOf } from "@/lib/instances";
import { summarise } from "@/lib/scoring";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatPula } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PanelPage({ searchParams }: { searchParams: { call?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const calls = await prisma.template.findMany({ select: { id: true, code: true, name: true }, orderBy: { code: "asc" } });
  const call = calls.find((c) => c.code === searchParams.call);

  const ideas = await prisma.instance.findMany({
    where: { status: { in: ["SHORTLISTED", "APPROVED", "AWARDED"] }, ...(call ? { templateId: call.id } : {}) },
    include: {
      template: true,
      innovator: { select: { organizationName: true, district: true } },
      fields: { where: { fieldKey: { in: ["funding_requested", "jobs_12m"] } }, select: { fieldKey: true, fieldValue: true } },
      evaluations: { select: { total: true, scores: true, submittedAt: true, conflict: true } },
    },
  });

  const rows = ideas
    .map((i) => {
      const s = summarise(schemaOf(i.template).criteria, i.evaluations);
      const v = fieldsToRecord(i.fields);
      return { i, s, funding: Number(v.funding_requested) || 0, jobs: Number(v.jobs_12m) || 0 };
    })
    .sort((a, b) => (b.s.mean ?? -1) - (a.s.mean ?? -1));

  const pending = rows.filter((r) => r.i.status !== "AWARDED");
  const awarded = rows.filter((r) => r.i.status === "AWARDED");
  const totalAwarded = awarded.reduce((a, r) => a + (r.i.awardAmount ?? 0), 0);
  const askPending = pending.reduce((a, r) => a + r.funding, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-ink">Panel shortlist</h1>
        <p className="mt-1 text-muted-foreground">
          Ideas ranked by mean evaluator score. Rows marked amber need discussion: evaluators were more than 20 points apart.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Awaiting decision" value={String(pending.length)} />
        <Tile label="Asked by those ideas" value={formatPula(askPending)} />
        <Tile label="Awarded" value={String(awarded.length)} />
        <Tile label="Total awarded" value={formatPula(totalAwarded)} accent />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip href="/dashboard/panel" active={!call}>All calls</Chip>
        {calls.map((c) => (
          <Chip key={c.id} href={`/dashboard/panel?call=${c.code}`} active={call?.id === c.id}>{c.code}</Chip>
        ))}
      </div>

      <Ranked title="Awaiting decision" rows={pending} empty="Nothing waiting for the panel." />
      {awarded.length > 0 && (
        <div className="mt-8">
          <Ranked title="Awarded" rows={awarded} />
        </div>
      )}
    </div>
  );
}

type Row = {
  i: { id: string; title: string; referenceCode: string; status: string; awardAmount: number | null; template: { code: string }; innovator: { organizationName: string | null; district: string | null } };
  s: ReturnType<typeof summarise>;
  funding: number;
  jobs: number;
};

function Ranked({ title, rows, empty }: { title: string; rows: Row[]; empty?: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white">
      <h2 className="border-b border-border px-5 py-3 font-semibold text-ceda-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ceda-sand text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Idea</th>
                <th className="px-4 py-2 text-right font-medium">Score</th>
                <th className="px-4 py-2 text-right font-medium">Range</th>
                <th className="px-4 py-2 text-right font-medium">Asked</th>
                <th className="px-4 py-2 text-right font-medium">Jobs</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, n) => (
                <tr key={r.i.id} className={cn("hover:bg-ceda-sand/60", r.s.disagreement && "bg-amber-50/60")}>
                  <td className="px-4 py-3 font-semibold text-muted-foreground">{n + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/panel/${r.i.id}`} className="font-medium text-ceda-ink hover:text-ceda-orange hover:underline">{r.i.title}</Link>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{r.i.referenceCode}</span> · {r.i.template.code} · {r.i.innovator.organizationName} · {r.i.innovator.district}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-ceda-ink">{r.s.mean ?? "—"}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.s.count} scores</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.s.min !== null ? `${r.s.min}–${r.s.max}` : "—"}
                    {r.s.disagreement && <AlertTriangle size={14} className="ml-1 inline text-amber-600" aria-label="Evaluators disagree" />}
                  </td>
                  <td className="px-4 py-3 text-right">{formatPula(r.funding)}</td>
                  <td className="px-4 py-3 text-right">{r.jobs}</td>
                  <td className="px-4 py-3">
                    {r.i.status === "AWARDED" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-ceda-green"><Trophy size={14} /> {formatPula(r.i.awardAmount)}</span>
                    ) : (
                      <StatusBadge status={r.i.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", active ? "border-ceda-ink bg-ceda-ink text-white" : "border-border bg-white hover:bg-ceda-sand")}>
      {children}
    </Link>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-transparent bg-gradient-to-br from-ceda-ink to-ceda-orange text-white" : "border-border bg-white")}>
      <p className={cn("text-2xl font-bold", accent ? "text-white" : "text-ceda-ink")}>{value}</p>
      <p className={cn("text-sm", accent ? "text-white/70" : "text-muted-foreground")}>{label}</p>
    </div>
  );
}
