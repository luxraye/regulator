import { computeRulesHash } from "./canonical";
import type {
  FormStageDefinition,
  GuardSettings,
  InstanceDefinition,
  RubricCriterion,
  StageDefinition,
  StageGate,
} from "./types";

export interface CompiledStage extends StageDefinition {
  status: "PAST" | "ACTIVE" | "FUTURE";
  isCurrent: boolean;
  timeRemainingMs: number;
  durationHours: number;
}

export interface CompiledRubric {
  criteria: RubricCriterion[];
  reviewersPerEntry: number;
  blind: boolean;
  disagreementThreshold: number;
  consensusRequired: boolean;
  publicVoteWeight: number;
  maxScore: number;
}

export interface CompiledInstance {
  rulesHash: string;
  name: string;
  slug: string;
  partnerSlug: string;
  stages: CompiledStage[];
  currentStage: CompiledStage | null;
  activeGate: StageGate;
  formsByStageId: Record<string, FormStageDefinition>;
  activeForm: FormStageDefinition | null;
  rubric: CompiledRubric;
  guards: GuardSettings;
  summary: {
    totalPrizesPula: number;
    stageCount: number;
    teamSizeLimit: string;
    isBlind: boolean;
    hasPublicVote: boolean;
  };
}

/**
 * Compiles a published Instance definition into executable runtime configuration.
 */
export function compileInstance(
  definition: InstanceDefinition,
  asOf: Date = new Date()
): CompiledInstance {
  const now = asOf.getTime();
  const rulesHash = computeRulesHash(definition);

  const rawTimeline = Array.isArray(definition?.timeline) ? definition.timeline : [];
  const compiledStages: CompiledStage[] = rawTimeline.map((stage) => {
    const startMs = new Date(stage.start).getTime();
    const endMs = new Date(stage.end).getTime();
    const durationHours = Math.max(0, Math.round(((endMs - startMs) / 3_600_000) * 10) / 10);

    let status: "PAST" | "ACTIVE" | "FUTURE" = "FUTURE";
    let isCurrent = false;
    let timeRemainingMs = 0;

    if (now > endMs) {
      status = "PAST";
    } else if (now >= startMs && now <= endMs) {
      status = "ACTIVE";
      isCurrent = true;
      timeRemainingMs = Math.max(0, endMs - now);
    } else {
      status = "FUTURE";
      timeRemainingMs = Math.max(0, startMs - now);
    }

    return {
      ...stage,
      status,
      isCurrent,
      timeRemainingMs,
      durationHours,
    };
  });

  const currentStage = compiledStages.find((s) => s.isCurrent) ?? null;
  const activeGate = currentStage ? currentStage.gate : "none";

  const formsByStageId: Record<string, FormStageDefinition> = {};
  const rawForms = Array.isArray(definition?.forms) ? definition.forms : [];
  for (const form of rawForms) {
    if (form?.stageId) {
      formsByStageId[form.stageId] = form;
    }
  }

  const activeForm = currentStage && formsByStageId[currentStage.id] ? formsByStageId[currentStage.id] : null;

  const rawPrizes = Array.isArray(definition?.meta?.prizes) ? definition.meta.prizes : [];
  const totalPrizesPula = rawPrizes.reduce((sum, p) => sum + (p.amountPula || 0), 0);

  const rawRubric = definition?.rubric || ({} as any);
  const rubric: CompiledRubric = {
    criteria: Array.isArray(rawRubric.criteria) ? rawRubric.criteria : [],
    reviewersPerEntry: rawRubric.reviewersPerEntry ?? 1,
    blind: Boolean(rawRubric.blind),
    disagreementThreshold: rawRubric.disagreementThreshold ?? 20,
    consensusRequired: Boolean(rawRubric.consensusRequired),
    publicVoteWeight: rawRubric.publicVoteWeight ?? 0,
    maxScore: 100,
  };

  const rawGuards = definition?.guards || {
    maxFileSizeMb: 50,
    allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg"],
    blockedMagicBytes: ["4d5a", "7f454c46"],
    requireScanClean: true,
    allowedExtensions: [".pdf", ".png", ".jpg", ".docx"],
  };

  const rawTeam = definition?.team || {
    minSize: 1,
    maxSize: 5,
    requireAllCitizen: false,
    ageLimit: null,
  };

  return {
    rulesHash,
    name: definition?.meta?.name || "Instance",
    slug: definition?.meta?.slug || "instance",
    partnerSlug: definition?.meta?.partnerSlug || "ceda",
    stages: compiledStages,
    currentStage,
    activeGate,
    formsByStageId,
    activeForm,
    rubric,
    guards: rawGuards,
    summary: {
      totalPrizesPula,
      stageCount: rawTimeline.length,
      teamSizeLimit: `${rawTeam.minSize ?? 1}–${rawTeam.maxSize ?? 5} members`,
      isBlind: rubric.blind,
      hasPublicVote: rubric.publicVoteWeight > 0,
    },
  };
}
