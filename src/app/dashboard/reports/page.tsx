import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { countBy, ideaRows, mean, weekly } from "@/lib/reports";
import { cn, formatPula } from "@/lib/utils";
import { ReportCharts } from "./analytics-charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: { call?: string } }) {
  const calls = await prisma.template.findMany({ select: { code: true }, orderBy: { code: "asc" } });
  const call = calls.find((c) => c.code === searchParams.call)?.code;
  const [rows, innovators, evaluators] = await Promise.all([
    ideaRows(call),
    prisma.user.count({ where: { role: "INNOVATOR" } }),
    prisma.user.findMany({
      where: { role: "EVALUATOR" },
      select: {
        name: true,
        evaluations: { where: call ? { instance: { template: { code: call } } } : {}, select: { assignedAt: true, submittedAt: true, dueAt: true, total: true, conflict: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const applicants = new Set(rows.map((r) => r.company)).size;
  const screened = rows.filter((r) => r.passedScreening).length;
  const shortlisted = rows.filter((r) => ["SHORTLISTED", "APPROVED", "AWARDED"].includes(r.status)).length;
  const awarded = rows.filter((r) => r.status === "AWARDED");
  const decided = rows.filter((r) => ["AWARDED", "REJECTED"].includes(r.status)).length;
  const totalAward = awarded.reduce((a, r) => a + (r.awardAmount ?? 0), 0);
  const jobs = awarded.reduce((a, r) => a + r.jobs, 0);
  const women = rows.filter((r) => r.gender === "Female").length;
  const rural = rows.filter((r) => !["Gaborone", "Francistown", "Lobatse", "Selebi-Phikwe", "Jwaneng", "Unknown"].includes(r.district)).length;

  const funnel = [
    { name: "Submitted", value: rows.length },
    { name: "Passed screening", value: screened },
    { name: "Shortlisted", value: shortlisted },
    { name: "Awarded", value: awarded.length },
  ];

  const now = Date.now();
  const evalRows = evaluators
    .map((e) => {
      const done = e.evaluations.filter((x) => x.submittedAt);
      return {
        name: e.name,
        assigned: e.evaluations.length,
        done: done.length,
        conflicts: e.evaluations.filter((x) => x.conflict).length,
        overdue: e.evaluations.filter((x) => !x.submittedAt && !x.conflict && x.dueAt.getTime() < now).length,
        avgScore: mean(done.map((x) => x.total)),
        avgDays: mean(done.map((x) => (x.submittedAt!.getTime() - x.assignedAt.getTime()) / 86_400_000)),
      };
    })
    .filter((e) => e.assigned > 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ceda-navy">Reports</h1>
          <p className="mt-1 text-muted-foreground">Participation, outcomes and timelines{call ? ` for ${call}` : " across all calls"}. Drafts are excluded.</p>
        </div>
        <a href={`/api/reports/export${call ? `?call=${call}` : ""}`} className="inline-flex items-center gap-2 rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white hover:bg-ceda-navy/90">
          <Download size={15} /> Export CSV
        </a>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Chip href="/dashboard/reports" active={!call}>All calls</Chip>
        {calls.map((c) => <Chip key={c.code} href={`/dashboard/reports?call=${c.code}`} active={call === c.code}>{c.code}</Chip>)}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Participation</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Ideas submitted" value={rows.length} sub={`from ${applicants} companies · ${innovators} registered innovators`} />
        <Tile label="Women-led applications" value={rows.length ? `${Math.round((women / rows.length) * 100)}%` : "—"} sub={`${women} of ${rows.length}`} />
        <Tile label="Outside the main towns" value={rows.length ? `${Math.round((rural / rows.length) * 100)}%` : "—"} sub={`${rural} ideas from rural districts`} />
        <Tile label="Resubmitted after feedback" value={rows.filter((r) => r.resubmissions > 0).length} sub="innovators who iterated" />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Outcomes</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Success rate" value={decided ? `${Math.round((awarded.length / decided) * 100)}%` : "—"} sub={`${awarded.length} awarded of ${decided} decided`} />
        <Tile label="Total awarded" value={formatPula(totalAward)} sub={awarded.length ? `average ${formatPula(Math.round(totalAward / awarded.length))}` : undefined} accent />
        <Tile label="Citizen jobs promised" value={jobs} sub="by awarded ideas, within 12 months" />
        <Tile label="Mean score" value={mean(rows.map((r) => r.meanScore)) ?? "—"} sub="of all scored ideas, out of 100" />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timelines (average days)</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Tile label="Submission to screening" value={mean(rows.map((r) => r.daysToScreening)) ?? "—"} sub="days, until evaluators are assigned" />
        <Tile label="Submission to shortlist" value={mean(rows.map((r) => r.daysToShortlist)) ?? "—"} sub="days, until every score is in" />
        <Tile label="Submission to decision" value={mean(rows.map((r) => r.daysToDecision)) ?? "—"} sub="days, until award or outcome" />
      </div>

      <ReportCharts
        funnel={funnel}
        byCall={countBy(rows, (r) => r.call)}
        bySector={countBy(rows, (r) => r.sector)}
        byDistrict={countBy(rows, (r) => r.district).slice(0, 10)}
        byGender={countBy(rows, (r) => r.gender)}
        byAge={countBy(rows, (r) => r.ageBand).sort((a, b) => a.name.localeCompare(b.name))}
        byWeek={weekly(rows)}
      />

      <section className="mt-8 overflow-hidden rounded-xl border border-border bg-white">
        <h2 className="border-b border-border px-5 py-3 font-semibold text-ceda-navy">Evaluator workload</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ceda-light text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Evaluator</th>
                <th className="px-4 py-2 text-right font-medium">Assigned</th>
                <th className="px-4 py-2 text-right font-medium">Scored</th>
                <th className="px-4 py-2 text-right font-medium">Conflicts</th>
                <th className="px-4 py-2 text-right font-medium">Overdue</th>
                <th className="px-4 py-2 text-right font-medium">Avg score</th>
                <th className="px-4 py-2 text-right font-medium">Avg days to score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {evalRows.map((e) => (
                <tr key={e.name}>
                  <td className="px-4 py-2.5 font-medium">{e.name}</td>
                  <td className="px-4 py-2.5 text-right">{e.assigned}</td>
                  <td className="px-4 py-2.5 text-right">{e.done}</td>
                  <td className="px-4 py-2.5 text-right">{e.conflicts}</td>
                  <td className={cn("px-4 py-2.5 text-right", e.overdue > 0 && "font-semibold text-red-600")}>{e.overdue}</td>
                  <td className="px-4 py-2.5 text-right">{e.avgScore ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right">{e.avgDays ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", active ? "border-ceda-navy bg-ceda-navy text-white" : "border-border bg-white hover:bg-ceda-light")}>
      {children}
    </Link>
  );
}

function Tile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-transparent bg-gradient-to-br from-ceda-navy to-ceda-blue text-white" : "border-border bg-white")}>
      <p className={cn("text-sm", accent ? "text-white/70" : "text-muted-foreground")}>{label}</p>
      <p className={cn("text-2xl font-bold", accent ? "text-white" : "text-ceda-navy")}>{value}</p>
      {sub && <p className={cn("text-xs", accent ? "text-white/70" : "text-muted-foreground")}>{sub}</p>}
    </div>
  );
}
