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

  const compiledStages: CompiledStage[] = definition.timeline.map((stage) => {
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
  for (const form of definition.forms) {
    formsByStageId[form.stageId] = form;
  }

  const activeForm = currentStage && formsByStageId[currentStage.id] ? formsByStageId[currentStage.id] : null;

  const totalPrizesPula = definition.meta.prizes.reduce((sum, p) => sum + (p.amountPula || 0), 0);

  const rubric: CompiledRubric = {
    criteria: definition.rubric.criteria,
    reviewersPerEntry: definition.rubric.reviewersPerEntry,
    blind: definition.rubric.blind,
    disagreementThreshold: definition.rubric.disagreementThreshold,
    consensusRequired: definition.rubric.consensusRequired,
    publicVoteWeight: definition.rubric.publicVoteWeight ?? 0,
    maxScore: 100,
  };

  return {
    rulesHash,
    name: definition.meta.name,
    slug: definition.meta.slug,
    partnerSlug: definition.meta.partnerSlug,
    stages: compiledStages,
    currentStage,
    activeGate,
    formsByStageId,
    activeForm,
    rubric,
    guards: definition.guards,
    summary: {
      totalPrizesPula,
      stageCount: definition.timeline.length,
      teamSizeLimit: `${definition.team.minSize}–${definition.team.maxSize} members`,
      isBlind: definition.rubric.blind,
      hasPublicVote: (definition.rubric.publicVoteWeight ?? 0) > 0,
    },
  };
}
