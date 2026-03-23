export interface ParsedRecord {
  [key: string]: string | number;
}

export function parseCSV(content: string): ParsedRecord[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const record: ParsedRecord = {};
    headers.forEach((header, i) => {
      const val = values[i] || "";
      const num = Number(val);
      record[header] = isNaN(num) || val === "" ? val : num;
    });
    return record;
  });
}

export function parseJSON(content: string): ParsedRecord[] {
  try {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

export function transformForAnalytics(
  records: ParsedRecord[],
  templateCode: string,
  licenseeId: string
) {
  return records.map((record) => ({
    ...record,
    _templateCode: templateCode,
    _licenseeId: licenseeId,
    _processedAt: new Date().toISOString(),
  }));
}
