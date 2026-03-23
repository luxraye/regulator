import { z } from "zod";

interface SchemaField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export function schemaFieldsToZod(fields: SchemaField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let validator: z.ZodTypeAny;

    if (field.type === "number") {
      let num = z.number();
      if (field.validation?.min !== undefined) num = num.min(field.validation.min);
      if (field.validation?.max !== undefined) num = num.max(field.validation.max);
      validator = num;
    } else {
      let str = z.string();
      if (field.validation?.pattern) str = str.regex(new RegExp(field.validation.pattern));
      validator = str;
    }

    if (!field.required) {
      validator = validator.optional();
    }

    shape[field.key] = validator;
  }

  return z.object(shape);
}
