export interface PdfPageCountResult {
  valid: boolean;
  pageCount: number;
  maxPages?: number;
  error?: string;
}

/**
 * Counts the number of pages in a PDF document buffer without native binaries.
 * Parses PDF catalog /Pages /Count dictionary entries and falls back to /Type /Page token counts.
 */
export function countPdfPages(buffer: Buffer, maxPages?: number): PdfPageCountResult {
  if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return {
      valid: false,
      pageCount: 0,
      maxPages,
      error: "Invalid PDF document.",
    };
  }

  const text = buffer.toString("binary");

  // Strategy 1: Look for top-level /Pages dictionary with /Count N
  // Matches e.g. /Type /Pages /Count 10 or /Count 10 ... /Type /Pages
  let detectedCount = 0;
  const countMatches = Array.from(text.matchAll(/\/Count\s+(\d+)/g));
  if (countMatches.length > 0) {
    // Top-level Pages catalog typically has the largest /Count value
    const counts = countMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n) && n > 0);
    if (counts.length > 0) {
      detectedCount = Math.max(...counts);
    }
  }

  // Strategy 2: Fallback to counting /Type /Page (excluding /Type /Pages)
  if (detectedCount === 0) {
    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    if (pageMatches) {
      detectedCount = pageMatches.length;
    }
  }

  // Strategy 3: Default to at least 1 if valid PDF
  if (detectedCount === 0) {
    detectedCount = 1;
  }

  const valid = maxPages ? detectedCount <= maxPages : true;
  return {
    valid,
    pageCount: detectedCount,
    maxPages,
    error: valid
      ? undefined
      : `Document has ${detectedCount} pages, exceeding the maximum allowed limit of ${maxPages} pages.`,
  };
}
