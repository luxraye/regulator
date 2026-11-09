import crypto from "crypto";

/**
 * Deterministically sorts object keys deeply to produce a canonical representation.
 * Handles arrays, objects, primitives, nulls, and undefined consistently.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "number") {
    // Standardize zero representation
    if (Object.is(value, -0)) return "0";
    return Number.isFinite(value) ? String(value) : "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalizeJson(item));
    return `[${items.join(",")}]`;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const pairs: string[] = [];

    for (const key of keys) {
      const val = obj[key];
      // Skip undefined object values to match standard JSON serialization
      if (val !== undefined) {
        pairs.push(`${JSON.stringify(key)}:${canonicalizeJson(val)}`);
      }
    }

    return `{${pairs.join(",")}}`;
  }

  return "null";
}

/**
 * Computes the canonical SHA-256 hex digest for any Instance definition or rules object.
 */
export function computeRulesHash(definition: unknown): string {
  const canonical = canonicalizeJson(definition);
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}
