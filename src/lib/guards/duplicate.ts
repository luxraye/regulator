import { prisma } from "@/lib/prisma";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateEntryReference?: string;
  duplicateEntryTitle?: string;
  details: string;
}

/**
 * Checks if a file hash has already been submitted under another Entry in the same competition instance.
 */
export async function checkCrossEntryDuplicate(
  instanceId: string,
  currentEntryId: string,
  fileHash: string
): Promise<DuplicateCheckResult> {
  const matchingFile = await prisma.entryFile.findFirst({
    where: {
      serverHash: fileHash,
      entryId: { not: currentEntryId },
      entry: {
        instanceId,
        status: { notIn: ["DRAFT", "REJECTED"] },
      },
    },
    include: {
      entry: {
        select: {
          id: true,
          referenceCode: true,
          title: true,
        },
      },
    },
  });

  if (matchingFile) {
    return {
      isDuplicate: true,
      duplicateEntryReference: matchingFile.entry.referenceCode,
      duplicateEntryTitle: matchingFile.entry.title,
      details: `File is identical to submission already lodged in entry "${matchingFile.entry.referenceCode}" (${matchingFile.entry.title}).`,
    };
  }

  return {
    isDuplicate: false,
    details: "File content is unique across submitted entries.",
  };
}
