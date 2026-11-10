import { InstanceDefinitionSchema } from "./schema";
import type { InstanceDefinition } from "./types";

export interface ValidationErrorDetail {
  path: string;
  message: string;
  section: string;
  code?: string;
}

export interface ValidationWarningDetail {
  path: string;
  message: string;
  section: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: ValidationWarningDetail[];
  definition?: InstanceDefinition;
}

/**
 * Validates an Instance definition across all 11 sections.
 * Returns friendly errors with explicit section and property paths.
 */
export function validateInstanceDefinition(input: unknown): ValidationResult {
  const errors: ValidationErrorDetail[] = [];
  const warnings: ValidationWarningDetail[] = [];

  const parsed = InstanceDefinitionSchema.safeParse(input);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const pathStr = issue.path.join(".");
      const section = String(issue.path[0] ?? "general");
      errors.push({
        path: pathStr || section,
        message: issue.message,
        section,
        code: issue.code,
      });
    }
    return { valid: false, errors, warnings };
  }

  const def = parsed.data as InstanceDefinition;

  // 1. Business rule: Rubric criteria weights must total exactly 100%
  const totalWeight = def.rubric.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.001) {
    errors.push({
      path: "rubric.criteria",
      section: "rubric",
      message: `Rubric criterion weights must sum to exactly 100% (currently ${totalWeight}%).`,
    });
  }

  // Check subcriteria weights if present
  for (let i = 0; i < def.rubric.criteria.length; i++) {
    const c = def.rubric.criteria[i];
    if (c.subcriteria && c.subcriteria.length > 0) {
      const subSum = c.subcriteria.reduce((s, sc) => s + (sc.weight || 0), 0);
      if (Math.abs(subSum - 100) > 0.001 && Math.abs(subSum - c.weight) > 0.001) {
        warnings.push({
          path: `rubric.criteria[${i}].subcriteria`,
          section: "rubric",
          message: `Subcriteria for "${c.label}" sum to ${subSum}%, recommended to match parent weight (${c.weight}%) or 100%.`,
        });
      }
    }
  }

  // 2. Business rule: Timeline validation
  for (let i = 0; i < def.timeline.length; i++) {
    const stage = def.timeline[i];
    const start = new Date(stage.start).getTime();
    const end = new Date(stage.end).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      errors.push({
        path: `timeline[${i}]`,
        section: "timeline",
        message: `Stage "${stage.name}" has invalid dates.`,
      });
      continue;
    }

    if (start > end) {
      errors.push({
        path: `timeline[${i}].end`,
        section: "timeline",
        message: `Stage "${stage.name}" ends before it starts (${stage.start} > ${stage.end}).`,
      });
    }

    if (i > 0) {
      const prevStage = def.timeline[i - 1];
      const prevStart = new Date(prevStage.start).getTime();
      if (start < prevStart) {
        warnings.push({
          path: `timeline[${i}].start`,
          section: "timeline",
          message: `Stage "${stage.name}" starts earlier than previous stage "${prevStage.name}". Verify stage ordering.`,
        });
      }
    }
  }

  // 3. Business rule: Team sizing
  if (def.team.minSize > def.team.maxSize) {
    errors.push({
      path: "team.minSize",
      section: "team",
      message: `Minimum team size (${def.team.minSize}) cannot exceed maximum team size (${def.team.maxSize}).`,
    });
  }

  // 4. Form stages should reference existing timeline stages or match standard kinds
  const stageIds = new Set(def.timeline.map((s) => s.id));
  for (let i = 0; i < def.forms.length; i++) {
    const form = def.forms[i];
    if (!stageIds.has(form.stageId)) {
      warnings.push({
        path: `forms[${i}].stageId`,
        section: "forms",
        message: `Form references stageId "${form.stageId}" which is not defined in the timeline.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    definition: errors.length === 0 ? def : undefined,
  };
}
