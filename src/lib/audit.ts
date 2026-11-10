import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";
import { canonicalizeJson } from "@/lib/instance-engine/canonical";

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

export interface AuditChainVerificationResult {
  valid: boolean;
  totalEvents: number;
  genesisHash: string;
  tipHash: string | null;
  brokenAtIndex?: number;
  brokenRecordId?: string;
  expectedHash?: string;
  actualHash?: string;
  details: string;
}

/**
 * Computes deterministic SHA-256 fingerprint for an audit log record.
 */
export function computeAuditRecordHash(
  prevHash: string,
  actorId: string,
  action: string,
  instanceId: string | null | undefined,
  entryId: string | null | undefined,
  metadata: unknown,
  timestampIso: string
): string {
  const canonMetadata = canonicalizeJson(metadata ?? {});
  const payload = `${prevHash}|${actorId}|${action}|${instanceId || ""}|${entryId || ""}|${canonMetadata}|${timestampIso}`;
  return sha256(Buffer.from(payload, "utf8"));
}

/**
 * Records an immutable, tamper-evident hash-chained audit log event.
 */
export async function audit(
  actorId: string,
  action: string,
  opts: { entryId?: string; instanceId?: string; metadata?: Prisma.InputJsonValue } = {}
) {
  // Find the previous record in the chain to maintain continuous cryptographic hash link
  const previousRecord = await prisma.auditLog.findFirst({
    where: opts.instanceId ? { instanceId: opts.instanceId } : undefined,
    orderBy: { createdAt: "desc" },
    select: { hash: true },
  });

  const prevHash = previousRecord?.hash || GENESIS_HASH;
  const now = new Date();
  const hash = computeAuditRecordHash(
    prevHash,
    actorId,
    action,
    opts.instanceId,
    opts.entryId,
    opts.metadata,
    now.toISOString()
  );

  return await prisma.auditLog.create({
    data: {
      actorId,
      action,
      instanceId: opts.instanceId,
      entryId: opts.entryId,
      metadata: opts.metadata,
      prevHash,
      hash,
      createdAt: now,
    },
  });
}

/**
 * Verifies the integrity of the audit log hash chain sequentially.
 * If any record has been modified, deleted, or reordered, pinpoints the exact breach.
 */
export async function verifyAuditChain(
  filter?: { instanceId?: string }
): Promise<AuditChainVerificationResult> {
  const records = await prisma.auditLog.findMany({
    where: filter?.instanceId ? { instanceId: filter.instanceId } : undefined,
    orderBy: { createdAt: "asc" },
  });

  if (records.length === 0) {
    return {
      valid: true,
      totalEvents: 0,
      genesisHash: GENESIS_HASH,
      tipHash: null,
      details: "Audit log chain is empty. Intact.",
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    // For historical un-hashed records, adopt their hash or compute forward
    const actualPrevHash = row.prevHash || (i === 0 ? GENESIS_HASH : records[i - 1].hash || GENESIS_HASH);

    if (i > 0 && row.prevHash && row.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        totalEvents: records.length,
        genesisHash: GENESIS_HASH,
        tipHash: records[records.length - 1].hash,
        brokenAtIndex: i,
        brokenRecordId: row.id,
        expectedHash: expectedPrevHash,
        actualHash: row.prevHash,
        details: `Hash chain broken at event #${i + 1} (${row.action}). Previous hash link does not match predecessor.`,
      };
    }

    if (row.hash) {
      const recomputed = computeAuditRecordHash(
        actualPrevHash,
        row.actorId,
        row.action,
        row.instanceId,
        row.entryId,
        row.metadata,
        row.createdAt.toISOString()
      );

      // Verify row integrity
      if (recomputed !== row.hash) {
        return {
          valid: false,
          totalEvents: records.length,
          genesisHash: GENESIS_HASH,
          tipHash: records[records.length - 1].hash,
          brokenAtIndex: i,
          brokenRecordId: row.id,
          expectedHash: recomputed,
          actualHash: row.hash,
          details: `Tamper detected at event #${i + 1} (ID: ${row.id}, Action: ${row.action}). Event content hash mismatch.`,
        };
      }
    }

    expectedPrevHash = row.hash || expectedPrevHash;
  }

  return {
    valid: true,
    totalEvents: records.length,
    genesisHash: GENESIS_HASH,
    tipHash: records[records.length - 1].hash || expectedPrevHash,
    details: `All ${records.length} audit trail records cryptographically verified. Zero tampering detected.`,
  };
}

export async function notify(userId: string, title: string, body: string, link?: string) {
  await prisma.notification.create({ data: { userId, title, body, link } });
}

/** Notify everyone with one of the given roles (e.g. all programme admins). */
export async function notifyRoles(roles: Role[], title: string, body: string, link?: string) {
  const users = await prisma.user.findMany({ where: { role: { in: roles } }, select: { id: true } });
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, title, body, link })),
  });
}
