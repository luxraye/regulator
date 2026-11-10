import { sha256 } from "@/lib/hash";
import { canonicalizeJson } from "@/lib/instance-engine/canonical";
import type { FaithfulnessReport, GuardCheckOutcome } from "./types";

/**
 * Builds a sealed Faithfulness Report from a set of check outcomes.
 * Generates a deterministic SHA-256 fingerprint over canonicalized check results.
 */
export function buildFaithfulnessReport(
  entryId: string,
  referenceCode: string,
  checks: GuardCheckOutcome[]
): FaithfulnessReport {
  let passedCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const c of checks) {
    if (c.status === "PASS") passedCount++;
    else if (c.status === "WARN") warnCount++;
    else if (c.status === "FAIL") failCount++;
  }

  const hardFailBlocked = failCount > 0;
  const isEligible = !checks.some((c) => c.category === "compliance" && c.status === "FAIL");

  // Sort checks deterministically by checkKey for reproducible hashing
  const sortedChecks = [...checks].sort((a, b) => a.checkKey.localeCompare(b.checkKey));

  const canonicalChecksJson = canonicalizeJson(sortedChecks);
  const faithfulnessHash = sha256(Buffer.from(canonicalChecksJson, "utf8"));

  return {
    entryId,
    referenceCode,
    timestamp: new Date().toISOString(),
    totalChecks: checks.length,
    passedCount,
    warnCount,
    failCount,
    isEligible,
    hardFailBlocked,
    checks: sortedChecks,
    faithfulnessHash,
  };
}
