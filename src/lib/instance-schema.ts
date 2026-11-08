/**
 * Shared (client + server) helpers for Instance template schemas.
 * A template schema is JSON: { fields: SchemaField[], required_files: RequiredFile[] }.
 */

export type FieldType = "text" | "number" | "textarea" | "date" | "select";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType | string;
  required: boolean;
  hint?: string;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface RequiredFile {
  key: string;
  label: string;
  extensions: string[];
  maxSizeMB: number;
  optional?: boolean;
}

/** One scoring criterion. Evaluators score 1-5; weights are percentages that add up to 100. */
export interface Criterion {
  key: string;
  label: string;
  weight: number;
  guide?: string;
}

export interface InstanceSchema {
  fields: SchemaField[];
  required_files: RequiredFile[];
  criteria: Criterion[];
}

/**
 * Uploads pass through a serverless function, which caps request bodies at ~4.5 MB on Vercel.
 * Templates may ask for more, but the effective limit is never above this.
 */
export const MAX_UPLOAD_MB = 4;

export function effectiveMaxMB(rf: RequiredFile) {
  return Math.min(rf.maxSizeMB, MAX_UPLOAD_MB);
}

/** States in which the innovator can edit. FLAGGED lets them respond to feedback and resubmit. */
export const EDITABLE_STATUSES = ["DRAFT", "FLAGGED"] as const;

export function isEditable(status: string) {
  return (EDITABLE_STATUSES as readonly string[]).includes(status);
}

/** Parse and sanity-check a schema. Returns an error string when invalid. */
export function parseSchema(raw: unknown): { schema: InstanceSchema; error: null } | { schema: null; error: string } {
  if (!raw || typeof raw !== "object") return { schema: null, error: "Schema must be an object" };
  const obj = raw as Record<string, unknown>;
  const fields = Array.isArray(obj.fields) ? obj.fields : null;
  const files = Array.isArray(obj.required_files) ? obj.required_files : [];
  if (!fields) return { schema: null, error: "Schema needs a \"fields\" array" };

  const keys = new Set<string>();
  for (const f of fields as SchemaField[]) {
    if (!f || typeof f.key !== "string" || !f.key || typeof f.label !== "string") {
      return { schema: null, error: "Every field needs a key and a label" };
    }
    if (!/^[a-z0-9_]+$/i.test(f.key)) return { schema: null, error: `Field key "${f.key}" may only use letters, numbers and _` };
    if (keys.has(f.key)) return { schema: null, error: `Duplicate field key "${f.key}"` };
    keys.add(f.key);
    if (f.validation?.pattern) {
      try {
        new RegExp(f.validation.pattern);
      } catch {
        return { schema: null, error: `Field "${f.key}" has an invalid pattern` };
      }
    }
  }
  for (const rf of files as RequiredFile[]) {
    if (!rf || typeof rf.key !== "string" || !Array.isArray(rf.extensions) || typeof rf.maxSizeMB !== "number") {
      return { schema: null, error: "Every required file needs a key, extensions[] and maxSizeMB" };
    }
  }
  const criteria = (Array.isArray(obj.criteria) ? obj.criteria : []) as Criterion[];
  for (const c of criteria) {
    if (!c || typeof c.key !== "string" || typeof c.label !== "string" || typeof c.weight !== "number" || c.weight <= 0) {
      return { schema: null, error: "Every criterion needs a key, a label and a positive weight" };
    }
  }
  if (criteria.length) {
    const total = criteria.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(total - 100) > 0.01) return { schema: null, error: `Criteria weights must add up to 100 (they add up to ${total})` };
  }
  return {
    schema: { fields: fields as SchemaField[], required_files: files as RequiredFile[], criteria },
    error: null,
  };
}

/** Validate one field value. Returns an error message or null. */
export function validateField(field: SchemaField, rawValue: string | undefined): string | null {
  const value = (rawValue ?? "").trim();
  if (!value) return field.required ? `${field.label} is required` : null;

  if (field.type === "number") {
    const num = Number(value);
    if (!Number.isFinite(num)) return "Must be a number";
    if (field.validation?.min !== undefined && num < field.validation.min) return `Minimum is ${field.validation.min}`;
    if (field.validation?.max !== undefined && num > field.validation.max) return `Maximum is ${field.validation.max}`;
  }
  if (field.type === "date" && Number.isNaN(Date.parse(value))) return "Must be a valid date";
  if (field.type === "select" && field.options && !field.options.includes(value)) return "Choose one of the options";
  if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
    return field.hint ? `Format: ${field.hint}` : "Invalid format";
  }
  return null;
}

/** Validate all fields. Pass `partial` to skip "required" checks (for drafts). */
export function validateFields(
  fields: SchemaField[],
  values: Record<string, string>,
  opts: { partial?: boolean } = {}
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.key];
    if (opts.partial && !value?.trim()) continue;
    const err = validateField(field, value);
    if (err) errors[field.key] = err;
  }
  return errors;
}

/** Check a file against its requirement. Returns an error message or null. */
export function validateFile(rf: RequiredFile, fileName: string, size: number): string | null {
  const dot = fileName.lastIndexOf(".");
  const ext = dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
  const allowed = rf.extensions.map((e) => e.toLowerCase());
  if (!allowed.includes(ext)) return `File type ${ext || "(none)"} not allowed. Use ${rf.extensions.join(", ")}`;
  const max = effectiveMaxMB(rf);
  if (size > max * 1024 * 1024) return `File is larger than ${max} MB`;
  if (size === 0) return "File is empty";
  return null;
}

/** Stable string form of field data, used for the data hash in receipts. */
export function canonicalFields(values: Record<string, string>): string {
  const sorted = Object.keys(values)
    .sort()
    .map((k) => [k, values[k]]);
  return JSON.stringify(sorted);
}

/** Map of field key to label, for showing stored data with human names. */
export function fieldLabels(schema: InstanceSchema | null | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  schema?.fields?.forEach((f) => (map[f.key] = f.label));
  return map;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
