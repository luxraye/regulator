import type { CheckStatus } from "@prisma/client";

export type GuardCategory = "file" | "security" | "link" | "compliance" | "faithfulness";

export interface GuardCheckOutcome {
  checkKey: string;
  name: string;
  category: GuardCategory;
  status: CheckStatus; // "PENDING" | "PASS" | "WARN" | "FAIL"
  detail: string;
  evidenceHash?: string;
  metadata?: Record<string, unknown>;
}

export interface FaithfulnessReport {
  entryId: string;
  referenceCode: string;
  timestamp: string;
  totalChecks: number;
  passedCount: number;
  warnCount: number;
  failCount: number;
  isEligible: boolean;
  hardFailBlocked: boolean;
  checks: GuardCheckOutcome[];
  faithfulnessHash: string; // SHA-256 over canonicalized checks
}
