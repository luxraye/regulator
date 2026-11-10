import type { AtomicRule, CompoundRule, RuleExpression, RuleOp } from "./types";

export interface EvaluationContext {
  age?: number;
  omang?: string | null;
  citizenship?: string | null;
  youthShareholding?: number | null;
  hasCompany?: boolean;
  companyNumber?: string | null;
  district?: string | null;
  teamSize?: number;
  affiliationDeclared?: boolean;
  consentGiven?: boolean;
  fields?: Record<string, string | number | boolean | null | undefined>;
  [key: string]: unknown;
}

export interface RuleEvaluationResult {
  ruleId?: string;
  field: string;
  label: string;
  passed: boolean;
  actualValue: unknown;
  expectedValue: unknown;
  op: RuleOp | "compound";
  message: string;
}

export interface RulesEvaluationReport {
  passed: boolean;
  score: number; // percentage of passed rules
  results: RuleEvaluationResult[];
}

/**
 * Evaluates an atomic comparison rule against an evaluation context.
 */
export function evaluateAtomicRule(rule: AtomicRule, context: EvaluationContext): RuleEvaluationResult {
  const actual = getNestedValue(context, rule.field);
  const expected = rule.value;
  let passed = false;

  switch (rule.op) {
    case "eq":
      passed = actual === expected;
      break;
    case "neq":
      passed = actual !== expected;
      break;
    case "gt":
      passed = typeof actual === "number" && typeof expected === "number" && actual > expected;
      break;
    case "gte":
      passed = typeof actual === "number" && typeof expected === "number" && actual >= expected;
      break;
    case "lt":
      passed = typeof actual === "number" && typeof expected === "number" && actual < expected;
      break;
    case "lte":
      passed = typeof actual === "number" && typeof expected === "number" && actual <= expected;
      break;
    case "between":
      if (Array.isArray(expected) && expected.length === 2 && typeof actual === "number") {
        const [min, max] = expected as [number, number];
        passed = actual >= min && actual <= max;
      }
      break;
    case "in":
      if (Array.isArray(expected)) {
        passed = expected.includes(actual as never);
      }
      break;
    case "not_in":
      if (Array.isArray(expected)) {
        passed = !expected.includes(actual as never);
      }
      break;
    case "contains":
      if (typeof actual === "string" && typeof expected === "string") {
        passed = actual.toLowerCase().includes(expected.toLowerCase());
      }
      break;
  }

  const defaultLabel = rule.label ?? formatFieldLabel(rule.field);
  const message = passed
    ? `${defaultLabel}: check passed.`
    : (rule.failureMessage ?? `${defaultLabel} did not meet criteria (expected ${rule.op} ${JSON.stringify(expected)}, received ${JSON.stringify(actual ?? "none")}).`);

  return {
    field: rule.field,
    label: defaultLabel,
    passed,
    actualValue: actual,
    expectedValue: expected,
    op: rule.op,
    message,
  };
}

/**
 * Recursively evaluates an arbitrary rule expression (atomic or compound).
 */
export function evaluateRuleExpression(expr: RuleExpression, context: EvaluationContext): RuleEvaluationResult {
  // If atomic
  if ("field" in expr && "op" in expr) {
    return evaluateAtomicRule(expr, context);
  }

  const compound = expr as CompoundRule;

  if (compound.all && compound.all.length > 0) {
    const subResults = compound.all.map((sub) => evaluateRuleExpression(sub, context));
    const allPassed = subResults.every((r) => r.passed);
    const label = compound.label ?? "All conditions met";
    const failedMessages = subResults.filter((r) => !r.passed).map((r) => r.message).join("; ");
    return {
      field: "all",
      label,
      passed: allPassed,
      actualValue: allPassed,
      expectedValue: true,
      op: "compound",
      message: allPassed ? `${label}: all passed.` : (compound.failureMessage ?? failedMessages),
    };
  }

  if (compound.any && compound.any.length > 0) {
    const subResults = compound.any.map((sub) => evaluateRuleExpression(sub, context));
    const anyPassed = subResults.some((r) => r.passed);
    const label = compound.label ?? "At least one condition met";
    return {
      field: "any",
      label,
      passed: anyPassed,
      actualValue: anyPassed,
      expectedValue: true,
      op: "compound",
      message: anyPassed ? `${label}: satisfied.` : (compound.failureMessage ?? "None of the required alternate conditions were met."),
    };
  }

  if (compound.not) {
    const subResult = evaluateRuleExpression(compound.not, context);
    const passed = !subResult.passed;
    const label = compound.label ?? `Not ${subResult.label}`;
    return {
      field: "not",
      label,
      passed,
      actualValue: subResult.actualValue,
      expectedValue: "negation",
      op: "compound",
      message: passed ? `${label}: passed.` : (compound.failureMessage ?? `Condition "${subResult.label}" must not hold.`),
    };
  }

  return {
    field: "unknown",
    label: "Unknown Rule",
    passed: false,
    actualValue: null,
    expectedValue: null,
    op: "compound",
    message: "Empty or unrecognized rule expression.",
  };
}

/**
 * Runs an entire suite of rules against a given context.
 */
export function evaluateRuleSuite(rules: RuleExpression[], context: EvaluationContext): RulesEvaluationReport {
  if (rules.length === 0) {
    return { passed: true, score: 100, results: [] };
  }

  const results = rules.map((r) => evaluateRuleExpression(r, context));
  const passedCount = results.filter((r) => r.passed).length;
  const score = Math.round((passedCount / rules.length) * 100);

  return {
    passed: passedCount === rules.length,
    score,
    results,
  };
}

export const evaluateRules = evaluateRuleSuite;

/**
 * Extracts dot-notated or direct keys from context.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (path in obj) return obj[path];
  if (obj.fields && typeof obj.fields === "object" && path in (obj.fields as Record<string, unknown>)) {
    return (obj.fields as Record<string, unknown>)[path];
  }
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function formatFieldLabel(field: string): string {
  switch (field) {
    case "age":
      return "Age (18–35)";
    case "omang":
      return "Citizen National ID (Omang)";
    case "youthShareholding":
      return "Youth Shareholding (>50%)";
    case "hasCompany":
      return "Registered Business (CIPA)";
    case "affiliationDeclared":
      return "Affiliation Declaration";
    case "consentGiven":
      return "Data Protection Consent";
    default:
      return field
        .split(/[._]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}
