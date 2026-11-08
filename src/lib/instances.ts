import type { Instance, InstanceField, InstanceFile, Template } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalFields, parseSchema, type InstanceSchema } from "@/lib/instance-schema";
import { sha256, verifyHash } from "@/lib/hash";
import { verifySubmission } from "@/lib/jwt-sign";

/** File metadata without the bytes, safe to send to the browser. */
export const fileMetaSelect = {
  id: true,
  fileKey: true,
  fileName: true,
  fileExtension: true,
  mimeType: true,
  fileSize: true,
  clientHash: true,
  serverHash: true,
  uploadedAt: true,
} as const;

export function schemaOf(template: Template): InstanceSchema {
  const parsed = parseSchema(template.schema);
  return parsed.schema ?? { fields: [], required_files: [], criteria: [] };
}

export function fieldsToRecord(fields: Pick<InstanceField, "fieldKey" | "fieldValue">[]) {
  const values: Record<string, string> = {};
  fields.forEach((f) => (values[f.fieldKey] = f.fieldValue));
  return values;
}

export function dataHashOf(fields: Pick<InstanceField, "fieldKey" | "fieldValue">[]) {
  return sha256(canonicalFields(fieldsToRecord(fields)));
}

export interface IntegrityReport {
  receiptValid: boolean;
  receiptReason: string | null;
  dataMatches: boolean;
  files: { fileKey: string; fileName: string; storedHashMatches: boolean; inReceipt: boolean }[];
  ok: boolean;
}

/**
 * Re-check a submitted instance end to end: the signed receipt, the field data
 * against the hash in the receipt, and every stored file against its hash.
 */
export async function checkIntegrity(instanceId: string): Promise<IntegrityReport | null> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId },
    include: { fields: true, files: true },
  });
  if (!instance?.submissionJwt) return null;
  return integrityOf(instance);
}

export function integrityOf(
  instance: Instance & { fields: InstanceField[]; files: InstanceFile[] }
): IntegrityReport | null {
  if (!instance.submissionJwt) return null;
  const result = verifySubmission(instance.submissionJwt);
  const payload = result.payload;
  const dataMatches = !!payload && payload.dataHash === dataHashOf(instance.fields);
  const files = instance.files.map((f) => {
    const entry = payload?.fileHashes?.find((h) => h.fileKey === f.fileKey);
    return {
      fileKey: f.fileKey,
      fileName: f.fileName,
      storedHashMatches: verifyHash(Buffer.from(f.content), f.serverHash),
      inReceipt: !!entry && entry.hash === f.serverHash,
    };
  });
  const allFilesListed = (payload?.fileHashes?.length ?? 0) === instance.files.length;
  return {
    receiptValid: result.valid,
    receiptReason: result.valid ? null : result.reason,
    dataMatches,
    files,
    ok: result.valid && dataMatches && allFilesListed && files.every((f) => f.storedHashMatches && f.inReceipt),
  };
}

/**
 * Who may read an idea: its innovator, CEDA staff and the panel, or an evaluator
 * assigned to it who has declared no conflict of interest.
 */
export async function canReadInstance(
  user: { id: string; role: string },
  instance: { id: string; innovatorId: string }
): Promise<boolean> {
  if (instance.innovatorId === user.id) return true;
  if (["ADMIN", "SUPERADMIN", "ADJUDICATOR"].includes(user.role)) return true;
  if (user.role === "EVALUATOR") {
    const ev = await prisma.evaluation.findUnique({
      where: { instanceId_evaluatorId: { instanceId: instance.id, evaluatorId: user.id } },
      select: { conflict: true },
    });
    return ev?.conflict === false;
  }
  return false;
}
