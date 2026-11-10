import { prisma } from "@/lib/prisma";
import { validateInstanceDefinition } from "./validator";
import { computeRulesHash, canonicalizeJson } from "./canonical";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "./types";

export interface PublishResult {
  success: boolean;
  rulesHash?: string;
  status?: string;
  errors?: string[];
}

export interface VersionBumpResult {
  success: boolean;
  version: number;
  rulesHash: string;
  reason: string;
  errors?: string[];
}

/**
 * Validates, canonicalizes, and seals a competition Instance for public launch.
 */
export async function publishInstance(
  instanceId: string,
  actorId: string
): Promise<PublishResult> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId },
  });

  if (!instance) {
    return { success: false, errors: ["Instance not found"] };
  }

  if (["PUBLISHED", "LIVE"].includes(instance.status)) {
    return { success: false, errors: ["Instance is already published"] };
  }

  const validation = validateInstanceDefinition(instance.definition);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors.map((e) => `[${e.section}] ${e.message}`),
    };
  }

  const definition = validation.definition!;
  const rulesHash = computeRulesHash(definition);
  const now = new Date();
  const opensAt = definition.timeline[0]?.start ? new Date(definition.timeline[0].start) : now;
  const closesAt = definition.timeline[definition.timeline.length - 1]?.end
    ? new Date(definition.timeline[definition.timeline.length - 1].end)
    : undefined;

  const targetStatus = opensAt <= now ? "LIVE" : "PUBLISHED";

  const updated = await prisma.instance.update({
    where: { id: instanceId },
    data: {
      status: targetStatus,
      rulesHash,
      opensAt,
      closesAt,
      definition: JSON.parse(canonicalizeJson(definition)),
    },
  });

  await audit(actorId, "INSTANCE_PUBLISHED", {
    instanceId,
    metadata: {
      rulesHash,
      targetStatus,
      stagesCount: definition.timeline.length,
      prizesCount: definition.meta.prizes.length,
    },
  });

  return {
    success: true,
    rulesHash: updated.rulesHash,
    status: updated.status,
  };
}

/**
 * Updates a published or live Instance by bumping its version and recording the reason.
 * Unversioned mutations on live Instances are strictly prohibited.
 */
export async function updateLiveInstance(
  instanceId: string,
  newDefinition: InstanceDefinition,
  reason: string,
  actorId: string
): Promise<VersionBumpResult> {
  const trimmedReason = reason?.trim();
  if (!trimmedReason || trimmedReason.length < 10) {
    return {
      success: false,
      version: 0,
      rulesHash: "",
      reason: "",
      errors: ["A clear justification (at least 10 characters) is required when updating a published Instance."],
    };
  }

  const instance = await prisma.instance.findUnique({
    where: { id: instanceId },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      entries: { select: { innovatorId: true } },
    },
  });

  if (!instance) {
    return { success: false, version: 0, rulesHash: "", reason: "", errors: ["Instance not found"] };
  }

  // Validate the new definition
  const validation = validateInstanceDefinition(newDefinition);
  if (!validation.valid) {
    return {
      success: false,
      version: 0,
      rulesHash: "",
      reason: "",
      errors: validation.errors.map((e) => `[${e.section}] ${e.message}`),
    };
  }

  const validDef = validation.definition!;
  const newRulesHash = computeRulesHash(validDef);

  if (newRulesHash === instance.rulesHash) {
    return {
      success: false,
      version: instance.versions[0]?.version ?? 1,
      rulesHash: instance.rulesHash,
      reason,
      errors: ["New definition is identical to the current sealed rules; no changes detected."],
    };
  }

  const nextVersion = (instance.versions[0]?.version ?? 1) + 1;

  // Compute a simple structural diff between previous and next definition
  const nextCanonical = canonicalizeJson(validDef);
  const diff = {
    previousRulesHash: instance.rulesHash,
    nextRulesHash: newRulesHash,
    timestamp: new Date().toISOString(),
  };

  const closesAt = validDef.timeline[validDef.timeline.length - 1]?.end
    ? new Date(validDef.timeline[validDef.timeline.length - 1].end)
    : instance.closesAt;

  // Transactionally record the new version and update the live instance
  await prisma.$transaction([
    prisma.instanceVersion.create({
      data: {
        instanceId,
        version: nextVersion,
        reason: trimmedReason,
        diff,
        definition: JSON.parse(nextCanonical),
        rulesHash: newRulesHash,
        createdById: actorId,
      },
    }),
    prisma.instance.update({
      where: { id: instanceId },
      data: {
        definition: JSON.parse(nextCanonical),
        rulesHash: newRulesHash,
        closesAt,
      },
    }),
  ]);

  await audit(actorId, "INSTANCE_VERSION_BUMPED", {
    instanceId,
    metadata: {
      version: nextVersion,
      previousRulesHash: instance.rulesHash,
      newRulesHash,
      reason: trimmedReason,
    },
  });

  // Notify all participating innovators about the rule revision
  const participantIds = Array.from(new Set(instance.entries.map((e) => e.innovatorId)));
  if (participantIds.length > 0) {
    await prisma.notification.createMany({
      data: participantIds.map((userId) => ({
        userId,
        title: `Rules updated for ${instance.name}`,
        body: `Instance version v${nextVersion} published: ${trimmedReason}`,
        link: `/instances/${instance.slug}`,
      })),
    });
  }

  return {
    success: true,
    version: nextVersion,
    rulesHash: newRulesHash,
    reason: trimmedReason,
  };
}
