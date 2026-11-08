/**
 * Eligibility rules from the competition guidelines (section 4.2a):
 * Batswana youth aged 18-35, applying through a company where youth hold more than 50%.
 */
export const MIN_AGE = 18;
export const MAX_AGE = 35;
export const MIN_YOUTH_SHAREHOLDING = 51;

export interface EligibilityInput {
  citizen?: boolean | null;
  omang?: string | null;
  dateOfBirth?: string | Date | null;
  youthShareholding?: number | null;
  hasCompany?: boolean | null;
}

export interface EligibilityCheck {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

export function ageOn(dob: Date, on = new Date()): number {
  let age = on.getFullYear() - dob.getFullYear();
  const m = on.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < dob.getDate())) age--;
  return age;
}

/** Omang numbers are 9 digits. */
export function isValidOmang(omang: string | null | undefined): boolean {
  return !!omang && /^\d{9}$/.test(omang.replace(/\s/g, ""));
}

export function checkEligibility(input: EligibilityInput): { eligible: boolean; checks: EligibilityCheck[] } {
  const checks: EligibilityCheck[] = [];

  const citizenOk = input.citizen !== false && (input.citizen === true || isValidOmang(input.omang));
  checks.push({
    key: "citizen",
    label: "Citizen of Botswana",
    ok: citizenOk,
    detail: citizenOk ? "Omang provided" : "You need a valid 9-digit Omang number",
  });

  let ageOk = false;
  let ageDetail = "Date of birth needed";
  if (input.dateOfBirth) {
    const dob = typeof input.dateOfBirth === "string" ? new Date(input.dateOfBirth) : input.dateOfBirth;
    if (!Number.isNaN(dob.getTime())) {
      const age = ageOn(dob);
      ageOk = age >= MIN_AGE && age <= MAX_AGE;
      ageDetail = ageOk ? `Age ${age}` : `Age ${age} is outside ${MIN_AGE}–${MAX_AGE}`;
    }
  }
  checks.push({ key: "age", label: `Aged ${MIN_AGE} to ${MAX_AGE}`, ok: ageOk, detail: ageDetail });

  if (input.hasCompany !== undefined) {
    checks.push({
      key: "company",
      label: "Registered company",
      ok: !!input.hasCompany,
      detail: input.hasCompany ? "CIPA registration provided" : "Apply through a company registered with CIPA",
    });
  }

  const pct = input.youthShareholding ?? null;
  const shareOk = pct !== null && pct >= MIN_YOUTH_SHAREHOLDING && pct <= 100;
  checks.push({
    key: "ownership",
    label: "More than 50% youth-owned",
    ok: shareOk,
    detail: pct === null ? "Youth shareholding needed" : shareOk ? `${pct}% youth-owned` : `${pct}% is not more than 50%`,
  });

  return { eligible: checks.every((c) => c.ok), checks };
}
