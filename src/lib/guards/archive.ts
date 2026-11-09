import zlib from "zlib";

export interface ArchiveEntry {
  fileName: string;
  compressedSize: number;
  uncompressedSize: number;
  isFolder: boolean;
  compressionMethod: number;
  dataOffset: number;
}

export interface ArchiveInspectionResult {
  valid: boolean;
  totalFiles: number;
  totalCompressedBytes: number;
  totalUncompressedBytes: number;
  compressionRatio: number;
  hasZipSlip: boolean;
  hasNestedArchives: boolean;
  nestedArchiveCount: number;
  entries: ArchiveEntry[];
  error?: string;
}

export interface ArchiveGuardLimits {
  maxRatio?: number;        // Default: 50x
  maxFiles?: number;        // Default: 250 files
  maxTotalBytes?: number;   // Default: 150 MB uncompressed
  maxDepth?: number;        // Default: 1 (no nested archives)
}

/**
 * Inspects a ZIP archive in memory without extracting it to disk.
 * Detects zip-slip path traversal, zip bombs (abnormal compression ratio),
 * and excessive file counts.
 */
export function inspectArchive(
  buffer: Buffer,
  limits: ArchiveGuardLimits = {}
): ArchiveInspectionResult {
  const maxRatio = limits.maxRatio ?? 50;
  const maxFiles = limits.maxFiles ?? 250;
  const maxTotalBytes = limits.maxTotalBytes ?? 150 * 1024 * 1024;

  let offset = 0;
  let totalFiles = 0;
  let totalCompressed = 0;
  let totalUncompressed = 0;
  let hasZipSlip = false;
  let hasNestedArchives = false;
  let nestedArchiveCount = 0;
  const entries: ArchiveEntry[] = [];

  // Parse Local File Headers (signature 0x04034b50)
  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) {
      break; // End of local file headers (or reached central directory)
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);

    if (offset + 30 + fileNameLength > buffer.length) {
      return {
        valid: false,
        totalFiles,
        totalCompressedBytes: totalCompressed,
        totalUncompressedBytes: totalUncompressed,
        compressionRatio: 0,
        hasZipSlip: false,
        hasNestedArchives: false,
        nestedArchiveCount: 0,
        entries,
        error: "Corrupted ZIP: File name extends beyond buffer boundary.",
      };
    }

    const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLength);
    const dataOffset = offset + 30 + fileNameLength + extraFieldLength;
    const isFolder = fileName.endsWith("/") || fileName.endsWith("\\");

    // Zip-slip path traversal checks
    if (
      fileName.includes("..") ||
      fileName.startsWith("/") ||
      fileName.startsWith("\\") ||
      /^[a-zA-Z]:/.test(fileName)
    ) {
      hasZipSlip = true;
    }

    // Check for nested archives
    const lowerName = fileName.toLowerCase();
    if (
      lowerName.endsWith(".zip") ||
      lowerName.endsWith(".tar") ||
      lowerName.endsWith(".gz") ||
      lowerName.endsWith(".7z") ||
      lowerName.endsWith(".rar")
    ) {
      hasNestedArchives = true;
      nestedArchiveCount++;
    }

    if (!isFolder) {
      totalFiles++;
      totalCompressed += compressedSize;
      totalUncompressed += uncompressedSize;
    }

    entries.push({
      fileName,
      compressedSize,
      uncompressedSize,
      isFolder,
      compressionMethod,
      dataOffset,
    });

    offset = dataOffset + compressedSize;
  }

  const compressionRatio =
    totalCompressed > 0 ? Math.round((totalUncompressed / totalCompressed) * 10) / 10 : 1;

  if (hasZipSlip) {
    return {
      valid: false,
      totalFiles,
      totalCompressedBytes: totalCompressed,
      totalUncompressedBytes: totalUncompressed,
      compressionRatio,
      hasZipSlip: true,
      hasNestedArchives,
      nestedArchiveCount,
      entries,
      error: "Archive contains forbidden path traversal patterns (zip-slip: '..' or absolute path).",
    };
  }

  if (totalFiles > maxFiles) {
    return {
      valid: false,
      totalFiles,
      totalCompressedBytes: totalCompressed,
      totalUncompressedBytes: totalUncompressed,
      compressionRatio,
      hasZipSlip: false,
      hasNestedArchives,
      nestedArchiveCount,
      entries,
      error: `Archive contains ${totalFiles} files, exceeding limit of ${maxFiles}.`,
    };
  }

  if (totalUncompressed > maxTotalBytes) {
    return {
      valid: false,
      totalFiles,
      totalCompressedBytes: totalCompressed,
      totalUncompressedBytes: totalUncompressed,
      compressionRatio,
      hasZipSlip: false,
      hasNestedArchives,
      nestedArchiveCount,
      entries,
      error: `Archive uncompressed size (${Math.round(totalUncompressed / (1024 * 1024))}MB) exceeds max allowable size (${Math.round(maxTotalBytes / (1024 * 1024))}MB).`,
    };
  }

  if (compressionRatio > maxRatio) {
    return {
      valid: false,
      totalFiles,
      totalCompressedBytes: totalCompressed,
      totalUncompressedBytes: totalUncompressed,
      compressionRatio,
      hasZipSlip: false,
      hasNestedArchives,
      nestedArchiveCount,
      entries,
      error: `Archive compression ratio (${compressionRatio}x) exceeds safe threshold (${maxRatio}x) - potential zip-bomb.`,
    };
  }

  return {
    valid: true,
    totalFiles,
    totalCompressedBytes: totalCompressed,
    totalUncompressedBytes: totalUncompressed,
    compressionRatio,
    hasZipSlip: false,
    hasNestedArchives,
    nestedArchiveCount,
    entries,
  };
}

/**
 * Extracts a specific file's content from a ZIP buffer in memory.
 */
export function extractFileFromArchive(buffer: Buffer, targetFileName: string): Buffer | null {
  const inspection = inspectArchive(buffer);
  const entry = inspection.entries.find(
    (e) => e.fileName.toLowerCase() === targetFileName.toLowerCase() || e.fileName.endsWith("/" + targetFileName)
  );

  if (!entry) return null;

  const rawBytes = buffer.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    // Stored
    return rawBytes;
  }

  if (entry.compressionMethod === 8) {
    // Deflated
    try {
      return zlib.inflateRawSync(rawBytes);
    } catch {
      return null;
    }
  }

  return null;
}
