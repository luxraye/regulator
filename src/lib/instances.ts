import type { Entry, EntryField, EntryFile, Template } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalFields, parseSchema, type InstanceSchema } from "@/lib/instance-schema";
import { sha256, verifyHash } from "@/lib/hash";
import { verifySubmission } from "@/lib/jwt-sign";

export type Instance = Entry;
export type InstanceField = EntryField;
export type InstanceFile = EntryFile;

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

export function schemaOf(template?: Template | null): InstanceSchema {
  if (!template) return { fields: [], required_files: [], criteria: [] };
  const parsed = parseSchema(template.schema);
  return parsed.schema ?? { fields: [], required_files: [], criteria: [] };
}

export function fieldsToRecord(fields: Pick<EntryField, "fieldKey" | "fieldValue">[]) {
  const values: Record<string, string> = {};
  fields.forEach((f) => (values[f.fieldKey] = f.fieldValue));
  return values;
}

export function dataHashOf(fields: Pick<EntryField, "fieldKey" | "fieldValue">[]) {
  return sha256(canonicalFields(fieldsToRecord(fields)));
}

export interface IntegrityReport {
  receiptValid: boolean;
  receiptReason: string | null;
  dataMatches: boolean;
  files: { fileKey: string; fileName: string; storedHashMatches: boolean; inReceipt: boolean }[];
  faithfulnessHash?: string | null;
  faithfulnessVerified?: boolean;
  ok: boolean;
}

/**
 * Re-check a submitted entry end to end: the signed receipt, the field data
 * against the hash in the receipt, and every stored file against its hash.
 */
export async function checkIntegrity(instanceId: string): Promise<IntegrityReport | null> {
  const entry = await prisma.entry.findUnique({
    where: { id: instanceId },
    include: { fields: true, files: true },
  });
  if (!entry?.submissionJwt) return null;
  return integrityOf(entry);
}

export function integrityOf(
  entry: Entry & { fields: EntryField[]; files: EntryFile[] }
): IntegrityReport | null {
  if (!entry.submissionJwt) return null;
  const result = verifySubmission(entry.submissionJwt);
  const payload = result.payload;
  const dataMatches = !!payload && payload.dataHash === dataHashOf(entry.fields);
  const files = entry.files.map((f) => {
    const item = payload?.fileHashes?.find((h) => h.fileKey === f.fileKey);
    return {
      fileKey: f.fileKey,
      fileName: f.fileName,
      storedHashMatches: verifyHash(Buffer.from(f.content), f.serverHash),
      inReceipt: !!item && item.hash === f.serverHash,
    };
  });
  const allFilesListed = (payload?.fileHashes?.length ?? 0) === entry.files.length;
  const faithfulnessHash = payload?.faithfulnessHash ?? null;
  const faithfulnessVerified = !payload?.faithfulnessHash || typeof payload.faithfulnessHash === "string";

  return {
    receiptValid: result.valid,
    receiptReason: result.valid ? null : result.reason,
    dataMatches,
    files,
    faithfulnessHash,
    faithfulnessVerified,
    ok: result.valid && dataMatches && allFilesListed && files.every((f) => f.storedHashMatches && f.inReceipt),
  };
}

/**
 * Who may read an idea: its innovator, CEDA staff and the panel, or an evaluator
 * assigned to it who has declared no conflict of interest.
 */
export async function canReadInstance(
  user: { id: string; role: string },
  entry: { id: string; innovatorId: string }
): Promise<boolean> {
  if (entry.innovatorId === user.id) return true;
  if (["ADMIN", "SUPERADMIN", "ADJUDICATOR", "PARTNER_ADMIN", "COMMITTEE_OBSERVER"].includes(user.role)) return true;
  if (user.role === "EVALUATOR") {
    const ev = await prisma.evaluation.findUnique({
      where: { entryId_evaluatorId: { entryId: entry.id, evaluatorId: user.id } },
      select: { conflict: true },
    });
    return ev?.conflict === false;
  }
  return false;
}
