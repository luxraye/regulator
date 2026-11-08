import type { Criterion } from "@/lib/instance-schema";

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

export const SCORE_GUIDE: Record<number, string> = {
  1: "Weak",
  2: "Below expectations",
  3: "Meets expectations",
  4: "Strong",
  5: "Exceptional",
};

/** Weighted score out of 100 from 1-5 scores. Returns null if any criterion is missing. */
export function weightedTotal(criteria: Criterion[], scores: Record<string, number>): number | null {
  if (!criteria.length) return null;
  let total = 0;
  for (const c of criteria) {
    const s = scores[c.key];
    if (typeof s !== "number" || s < SCORE_MIN || s > SCORE_MAX) return null;
    total += (s / SCORE_MAX) * c.weight;
  }
  return Math.round(total * 10) / 10;
}

export interface PanelSummary {
  count: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  spread: number | null;
  /** Evaluators disagree by more than 20 points. */
  disagreement: boolean;
  perCriterion: Record<string, number>;
}

export function summarise(
  criteria: Criterion[],
  evaluations: { total: number | null; scores: unknown; submittedAt: Date | string | null; conflict: boolean | null }[]
): PanelSummary {
  const done = evaluations.filter((e) => e.submittedAt && e.conflict === false && typeof e.total === "number");
  const totals = done.map((e) => e.total as number);
  const perCriterion: Record<string, number> = {};
  for (const c of criteria) {
    const vals = done.map((e) => (e.scores as Record<string, number>)?.[c.key]).filter((v) => typeof v === "number");
    if (vals.length) perCriterion[c.key] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }
  if (!totals.length) {
    return { count: 0, mean: null, min: null, max: null, spread: null, disagreement: false, perCriterion };
  }
  const mean = Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10;
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  return { count: totals.length, mean, min, max, spread: max - min, disagreement: max - min > 20, perCriterion };
}
