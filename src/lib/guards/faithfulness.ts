import { evaluateRules } from "@/lib/instance-engine/rules";
import type { FormFieldDefinition, RuleExpression } from "@/lib/instance-engine/types";
import type { GuardCheckOutcome } from "./types";

export interface FaithfulnessEvaluationInput {
  eligibilityRules: RuleExpression[];
  candidateData: Record<string, unknown>;
  formFields: FormFieldDefinition[];
  submittedFields: Record<string, string>;
  affiliationsDeclared: boolean;
  dpaConsentRecorded: boolean;
}

/**
 * Runs compliance and faithfulness evaluations:
 * - Eligibility AST evaluation
 * - Questionnaire completeness: every question answered or explicitly marked N/A
 * - Affiliations and conflicts declared
 * - DPA consent recorded
 */
export function evaluateFaithfulness(input: FaithfulnessEvaluationInput): GuardCheckOutcome[] {
  const outcomes: GuardCheckOutcome[] = [];

  // 1. Eligibility evaluation
  const ruleReport = evaluateRules(input.eligibilityRules, input.candidateData);
  outcomes.push({
    checkKey: "eligibility_rules",
    name: "Statutory Eligibility Assessment",
    category: "compliance",
    status: ruleReport.passed ? "PASS" : "FAIL",
    detail: ruleReport.passed
      ? "All citizen and competition eligibility criteria satisfied."
      : `Eligibility check failed: ${ruleReport.results.filter((r) => !r.passed).map((r) => r.message).join("; ")}`,
    metadata: { score: ruleReport.score, results: ruleReport.results },
  });

  // 2. Questionnaire completeness: every required question answered or N/A
  const missingOrEmpty: string[] = [];
  for (const field of input.formFields) {
    const val = input.submittedFields[field.key]?.trim();
    if (field.required) {
      if (!val) {
        missingOrEmpty.push(field.label);
      } else {
        // Accept valid answer or explicit N/A
        const isNA = /^(n\/?a|not applicable|ga gona)$/i.test(val);
        if (isNA && field.naAllowed === false) {
          missingOrEmpty.push(`${field.label} (N/A not permitted)`);
        }
      }
    }
  }

  outcomes.push({
    checkKey: "all_questions_answered_or_na",
    name: "Questionnaire Completeness (All Answered or N/A)",
    category: "faithfulness",
    status: missingOrEmpty.length === 0 ? "PASS" : "FAIL",
    detail:
      missingOrEmpty.length === 0
        ? "All mandatory questionnaire items answered or explicitly marked N/A."
        : `Unanswered questions: ${missingOrEmpty.join(", ")}.`,
  });

  // 3. Affiliations & Conflict of Interest declaration
  outcomes.push({
    checkKey: "affiliations_declared",
    name: "Affiliations & Conflict of Interest Declaration",
    category: "faithfulness",
    status: input.affiliationsDeclared ? "PASS" : "FAIL",
    detail: input.affiliationsDeclared
      ? "Conflict of interest and public affiliation statement formally declared."
      : "Mandatory affiliations and conflict of interest declaration has not been completed.",
  });

  // 4. Data Protection Act 2024 Consent recorded
  outcomes.push({
    checkKey: "dpa_consent_recorded",
    name: "Botswana Data Protection Act 2024 Consent",
    category: "compliance",
    status: input.dpaConsentRecorded ? "PASS" : "FAIL",
    detail: input.dpaConsentRecorded
      ? "Statutory applicant consent recorded under the Botswana Data Protection Act, 2024."
      : "Data processing consent under Botswana DPA 2024 is required before submission.",
  });

  return outcomes;
}
