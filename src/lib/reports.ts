import { prisma } from "@/lib/prisma";
import { fieldsToRecord, schemaOf } from "@/lib/instances";
import { summarise } from "@/lib/scoring";
import { ageOn } from "@/lib/eligibility";
import { instanceStatusMeta, sectorName, stageName } from "@/lib/labels";

const DAY = 86_400_000;
const PASSED_SCREENING = ["UNDER_REVIEW", "SHORTLISTED", "APPROVED", "AWARDED"];

/** One flat row per submitted idea: the basis for every report and the CSV export. */
export async function ideaRows(callCode?: string) {
  const ideas = await prisma.entry.findMany({
    where: { status: { not: "DRAFT" }, ...(callCode ? { template: { code: callCode } } : {}) },
    include: {
      template: true,
      innovator: { select: { organizationName: true, district: true, gender: true, dateOfBirth: true, youthShareholding: true } },
      fields: { where: { fieldKey: { in: ["funding_requested", "jobs_12m"] } }, select: { fieldKey: true, fieldValue: true } },
      evaluations: { select: { total: true, scores: true, submittedAt: true, conflict: true } },
      audits: { where: { action: { in: ["EVALUATORS_ASSIGNED", "IDEA_SHORTLISTED", "IDEA_FLAGGED"] } }, select: { action: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return ideas.map((i) => {
    const v = fieldsToRecord(i.fields);
    const s = i.template ? summarise(schemaOf(i.template).criteria, i.evaluations) : { mean: null, count: 0, disagreement: false };
    const sub = i.submittedAt?.getTime() ?? null;
    const at = (a: string) => i.audits.find((x) => x.action === a)?.createdAt.getTime() ?? null;
    const days = (t: number | null) => (sub && t ? Math.max(0, Math.round(((t - sub) / DAY) * 10) / 10) : null);
    const age = i.innovator.dateOfBirth ? ageOn(i.innovator.dateOfBirth, i.submittedAt ?? new Date()) : null;
    const decided = ["AWARDED", "REJECTED", "APPROVED"].includes(i.status) ? i.reviewedAt?.getTime() ?? null : null;
    return {
      reference: i.referenceCode,
      title: i.title,
      call: i.template?.code ?? "",
      sector: i.template ? sectorName(i.template.dataType) : "General Innovation",
      stage: i.template ? stageName(i.template.scale) : "All stages",
      company: i.innovator.organizationName ?? "",
      district: i.innovator.district ?? "Unknown",
      gender: i.innovator.gender ?? "Not stated",
      age,
      ageBand: age === null ? "Unknown" : age <= 24 ? "18–24" : age <= 29 ? "25–29" : "30–35",
      youthShareholding: i.innovator.youthShareholding,
      status: i.status,
      statusLabel: instanceStatusMeta[i.status]?.label ?? i.status,
      submittedAt: i.submittedAt,
      resubmissions: Math.max(0, i.submissionCount - 1),
      fundingRequested: Number(v.funding_requested) || 0,
      jobs: Number(v.jobs_12m) || 0,
      meanScore: s.mean,
      scores: s.count,
      disagreement: s.disagreement,
      awardAmount: i.awardAmount,
      daysToScreening: days(at("EVALUATORS_ASSIGNED") ?? (i.status === "REJECTED" ? decided : null)),
      daysToShortlist: days(at("IDEA_SHORTLISTED")),
      daysToDecision: days(decided),
      passedScreening: PASSED_SCREENING.includes(i.status) || i.evaluations.length > 0,
    };
  });
}

export type IdeaRow = Awaited<ReturnType<typeof ideaRows>>[number];

export function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1));
  return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export const mean = (xs: (number | null | undefined)[]) => {
  const n = xs.filter((x): x is number => typeof x === "number");
  return n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 10) / 10 : null;
};

/** Submissions per ISO week, oldest first. */
export function weekly(rows: IdeaRow[]) {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (!r.submittedAt) continue;
    const d = new Date(r.submittedAt);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const k = d.toISOString().slice(0, 10);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return Array.from(m, ([week, value]) => ({ week, value })).sort((a, b) => a.week.localeCompare(b.week));
}
