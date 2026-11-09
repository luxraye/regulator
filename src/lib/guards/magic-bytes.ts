import path from "path";

export interface MagicByteResult {
  valid: boolean;
  detectedMime: string;
  expectedExtension: string;
  error?: string;
}

/**
 * Validates file buffer against known binary signatures (magic numbers)
 * to prevent extension spoofing or corrupted payloads.
 */
export function verifyMagicBytes(fileName: string, buffer: Buffer): MagicByteResult {
  const ext = path.extname(fileName).toLowerCase();

  if (buffer.length < 4) {
    return {
      valid: false,
      detectedMime: "application/octet-stream",
      expectedExtension: ext,
      error: `File "${fileName}" is truncated or empty (${buffer.length} bytes).`,
    };
  }

  // PDF
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    const valid = ext === ".pdf";
    return {
      valid,
      detectedMime: "application/pdf",
      expectedExtension: ext,
      error: valid ? undefined : `File contains PDF magic bytes but has extension "${ext}".`,
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    const valid = ext === ".png";
    return {
      valid,
      detectedMime: "image/png",
      expectedExtension: ext,
      error: valid ? undefined : `File contains PNG image header but has extension "${ext}".`,
    };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    const valid = ext === ".jpg" || ext === ".jpeg";
    return {
      valid,
      detectedMime: "image/jpeg",
      expectedExtension: ext,
      error: valid ? undefined : `File contains JPEG image header but has extension "${ext}".`,
    };
  }

  // ZIP or Office OOXML (ZIP container starting with PK\x03\x04 or PK\x05\x06)
  if (
    (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) ||
    (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x05 && buffer[3] === 0x06)
  ) {
    const isZipFamily = [".zip", ".pptx", ".xlsx", ".docx"].includes(ext);
    let detectedMime = "application/zip";
    if (ext === ".pptx") detectedMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (ext === ".xlsx") detectedMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (ext === ".docx") detectedMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return {
      valid: isZipFamily,
      detectedMime,
      expectedExtension: ext,
      error: isZipFamily ? undefined : `File contains PK ZIP header but extension "${ext}" is not a recognized archive or office container.`,
    };
  }

  // CSV or plain text (check first 512 bytes for lack of binary nulls)
  if (ext === ".csv" || ext === ".txt" || ext === ".md" || ext === ".json") {
    const sample = buffer.subarray(0, Math.min(buffer.length, 512));
    const hasNull = sample.includes(0x00);
    return {
      valid: !hasNull,
      detectedMime: ext === ".json" ? "application/json" : "text/plain",
      expectedExtension: ext,
      error: !hasNull ? undefined : `File "${fileName}" contains binary null characters and is not a valid text/csv format.`,
    };
  }

  return {
    valid: false,
    detectedMime: "application/octet-stream",
    expectedExtension: ext,
    error: `Unsupported file format "${ext}" with unrecognized magic bytes.`,
  };
}
