import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";
import { canonicalizeJson } from "./canonical";
import type { InstanceDefinition } from "./types";

export interface LeaderboardEntry {
  rank: number;
  entryId: string;
  referenceCode: string;
  title: string;
  organizationName: string;
  meanScore: number;
  reviewerCount: number;
  criteriaScores: Record<string, number>;
  awardedRank?: number | null;
  awardAmount?: number | null;
}

export interface LeaderboardResult {
  instanceId: string;
  instanceName: string;
  instanceSlug: string;
  computedAt: string;
  totalEntries: number;
  evaluatedEntriesCount: number;
  leaderboardHash: string; // Deterministic SHA-256 fingerprint over rankings & scores
  entries: LeaderboardEntry[];
  summary: {
    topScore: number;
    medianScore: number;
    averageScore: number;
    winner?: {
      referenceCode: string;
      title: string;
      score: number;
    };
  };
}

/**
 * Deterministically recomputes the competition leaderboard from stored evaluator
 * scorecards, rubric weights, and conflict exclusions. Generates a reproducible
 * SHA-256 fingerprint proving mathematical integrity.
 */
export async function computeLeaderboard(instanceId: string): Promise<LeaderboardResult | null> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId },
    include: {
      entries: {
        where: { status: { notIn: ["DRAFT", "REJECTED"] } },
        include: {
          innovator: { select: { organizationName: true, name: true } },
          evaluations: {
            where: {
              submittedAt: { not: null },
              conflict: false,
            },
            select: {
              id: true,
              total: true,
              scores: true,
              submittedAt: true,
            },
          },
        },
      },
    },
  });

  if (!instance) return null;

  const definition = instance.definition as unknown as InstanceDefinition;
  const criteria = definition.rubric?.criteria ?? [];
  const entriesWithScores: LeaderboardEntry[] = [];

  for (const entry of instance.entries) {
    const validEvals = entry.evaluations.filter((ev) => ev.total != null);
    if (validEvals.length === 0) continue;

    const totalScores = validEvals.map((ev) => ev.total as number);
    const meanScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / validEvals.length) * 10) / 10;

    // Compute average score per rubric criterion
    const criteriaScores: Record<string, number> = {};
    for (const crit of criteria) {
      const critScores: number[] = [];
      for (const ev of validEvals) {
        if (ev.scores && typeof ev.scores === "object" && crit.key in (ev.scores as Record<string, unknown>)) {
          const val = Number((ev.scores as Record<string, unknown>)[crit.key]);
          if (!isNaN(val)) critScores.push(val);
        }
      }
      criteriaScores[crit.key] =
        critScores.length > 0
          ? Math.round((critScores.reduce((a, b) => a + b, 0) / critScores.length) * 10) / 10
          : Math.round(((meanScore * (crit.weight / 100))) * 10) / 10;
    }

    entriesWithScores.push({
      rank: 0,
      entryId: entry.id,
      referenceCode: entry.referenceCode,
      title: entry.title,
      organizationName: entry.innovator.organizationName || entry.innovator.name,
      meanScore,
      reviewerCount: validEvals.length,
      criteriaScores,
      awardedRank: entry.rank,
      awardAmount: entry.awardAmount,
    });
  }

  // Sort descending by score, deterministic tie-break by referenceCode
  entriesWithScores.sort((a, b) => {
    if (b.meanScore !== a.meanScore) {
      return b.meanScore - a.meanScore;
    }
    return a.referenceCode.localeCompare(b.referenceCode);
  });

  // Assign ranks
  entriesWithScores.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  // Compute canonical fingerprint
  const canonicalData = canonicalizeJson(
    entriesWithScores.map((e) => ({
      rank: e.rank,
      referenceCode: e.referenceCode,
      meanScore: e.meanScore,
      criteriaScores: e.criteriaScores,
    }))
  );
  const leaderboardHash = sha256(Buffer.from(canonicalData, "utf8"));

  // Calculate summary stats
  const allMeans = entriesWithScores.map((e) => e.meanScore);
  const topScore = allMeans.length > 0 ? Math.max(...allMeans) : 0;
  const averageScore =
    allMeans.length > 0 ? Math.round((allMeans.reduce((a, b) => a + b, 0) / allMeans.length) * 10) / 10 : 0;
  const sortedMeans = [...allMeans].sort((a, b) => a - b);
  const medianScore =
    sortedMeans.length > 0 ? sortedMeans[Math.floor(sortedMeans.length / 2)] : 0;

  return {
    instanceId: instance.id,
    instanceName: instance.name,
    instanceSlug: instance.slug,
    computedAt: new Date().toISOString(),
    totalEntries: instance.entries.length,
    evaluatedEntriesCount: entriesWithScores.length,
    leaderboardHash,
    entries: entriesWithScores,
    summary: {
      topScore,
      medianScore,
      averageScore,
      winner:
        entriesWithScores[0]
          ? {
              referenceCode: entriesWithScores[0].referenceCode,
              title: entriesWithScores[0].title,
              score: entriesWithScores[0].meanScore,
            }
          : undefined,
    },
  };
}
