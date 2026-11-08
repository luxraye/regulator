import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound } from "@/lib/session";
import { isEditable, validateFields } from "@/lib/instance-schema";
import { schemaOf } from "@/lib/instances";

export const dynamic = "force-dynamic";

/** Save answers as a draft. Values are checked, but required fields may be blank. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(["INNOVATOR"]);
  if (error) return error;

  const instance = await prisma.instance.findUnique({ where: { id: params.id }, include: { template: true } });
  if (!instance || instance.innovatorId !== user.id) return notFound();
  if (!isEditable(instance.status)) return badRequest("This idea is submitted and locked. It can only be edited if CEDA asks for changes");

  const body = await req.json().catch(() => null);
  const input = body?.fields;
  if (!input || typeof input !== "object") return badRequest("Expected { fields: { key: value } }");

  const schema = schemaOf(instance.template);
  const allowed = new Set(schema.fields.map((f) => f.key));
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!allowed.has(key)) continue; // ignore keys the template doesn't define
    const str = value == null ? "" : String(value).trim();
    if (str) values[key] = str.slice(0, 10_000);
  }

  const errors = validateFields(schema.fields, values, { partial: true });
  if (Object.keys(errors).length) return badRequest("Some values are invalid", { fieldErrors: errors });

  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 140) : null;
  if (title !== null && title.length < 4) return badRequest("Title must be at least 4 characters");

  await prisma.$transaction([
    prisma.instanceField.deleteMany({ where: { instanceId: instance.id } }),
    prisma.instanceField.createMany({
      data: Object.entries(values).map(([fieldKey, fieldValue]) => ({
        instanceId: instance.id,
        fieldKey,
        fieldValue,
        validatedAt: new Date(),
      })),
    }),
    ...(title ? [prisma.instance.update({ where: { id: instance.id }, data: { title } })] : []),
  ]);

  return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
}
