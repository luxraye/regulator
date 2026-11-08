import type { InstanceSchema } from "@/lib/instance-schema";
import { checkEligibility } from "@/lib/eligibility";
import { formatPula } from "@/lib/utils";

export interface Insight {
  label: string;
  value: string;
  status: "good" | "warn" | "bad" | "info";
  note?: string;
}

const n = (v: string | undefined) => (v === undefined || v === "" ? NaN : Number(v));

/**
 * Screening checks a programme officer would otherwise do by hand:
 * eligibility from the applicant profile, and sanity checks on the money and jobs asked for.
 */
export function screeningInsights(
  values: Record<string, string>,
  schema: InstanceSchema,
  applicant: { omang?: string | null; dateOfBirth?: Date | null; youthShareholding?: number | null; licenseNumber?: string | null }
): Insight[] {
  const out: Insight[] = [];

  const elig = checkEligibility({
    omang: applicant.omang,
    dateOfBirth: applicant.dateOfBirth,
    youthShareholding: applicant.youthShareholding,
    hasCompany: !!applicant.licenseNumber,
  });
  const failed = elig.checks.filter((c) => !c.ok);
  out.push({
    label: "Eligibility",
    value: elig.eligible ? "All rules met" : `${failed.length} rule${failed.length === 1 ? "" : "s"} failed`,
    status: elig.eligible ? "good" : "bad",
    note: elig.checks.map((c) => c.detail).join(" · "),
  });

  const funding = n(values.funding_requested);
  const cap = schema.fields.find((f) => f.key === "funding_requested")?.validation?.max;
  if (Number.isFinite(funding)) {
    const share = cap ? funding / cap : null;
    out.push({
      label: "Funding requested",
      value: formatPula(funding),
      status: share === null ? "info" : share > 1 ? "bad" : share > 0.9 ? "warn" : "good",
      note: cap ? `${Math.round((share ?? 0) * 100)}% of the ${formatPula(cap)} call ceiling` : undefined,
    });
  }

  const jobs = n(values.jobs_12m);
  if (Number.isFinite(jobs)) {
    const perJob = jobs > 0 && Number.isFinite(funding) ? funding / jobs : null;
    out.push({
      label: "Cost per citizen job",
      value: perJob === null ? (jobs === 0 ? "No jobs claimed" : "—") : formatPula(Math.round(perJob)),
      status: perJob === null ? "warn" : perJob <= 40_000 ? "good" : perJob <= 100_000 ? "warn" : "bad",
      note: `${jobs} job${jobs === 1 ? "" : "s"} in 12 months · CEDA guide: under P40,000 a job is strong`,
    });
  }

  const missingText = schema.fields.filter((f) => f.type === "textarea" && (values[f.key] ?? "").trim().length < 60);
  out.push({
    label: "Depth of answers",
    value: missingText.length ? `${missingText.length} thin answer${missingText.length === 1 ? "" : "s"}` : "Complete",
    status: missingText.length ? "warn" : "good",
    note: missingText.length ? missingText.map((f) => f.label).join(", ") : "Every long answer has some substance",
  });

  return out;
}
