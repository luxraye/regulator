import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, STAFF_ROLES } from "@/lib/session";
import { parseSchema } from "@/lib/instance-schema";
import { SCALES, DATA_TYPES } from "@/lib/labels";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const templates = await prisma.template.findMany({
    orderBy: [{ dataType: "asc" }, { scale: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      scale: true,
      dataType: true,
      schema: true,
      createdAt: true,
      _count: { select: { instances: true } },
    },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(["SUPERADMIN"]);
  if (error) return error;

  const { code, name, description, scale, dataType, schema } = (await req.json().catch(() => ({}))) ?? {};
  if (!code || !name || !scale || !dataType || !schema) return badRequest("Missing required fields");
  if (!/^[A-Z0-9_]{2,32}$/.test(code)) return badRequest("Code must be 2–32 capital letters, numbers or _");
  if (!(SCALES as readonly string[]).includes(scale) || !(DATA_TYPES as readonly string[]).includes(dataType)) {
    return badRequest("Unknown scale or data type");
  }
  const parsed = parseSchema(schema);
  if (parsed.error) return badRequest(parsed.error);

  if (await prisma.template.findUnique({ where: { code } })) {
    return NextResponse.json({ error: `A template with code ${code} already exists` }, { status: 409 });
  }

  const template = await prisma.template.create({
    data: { code, name, description: description || null, scale, dataType, schema: parsed.schema as object, createdById: user.id },
  });
  await audit(user.id, "TEMPLATE_CREATED", { metadata: { code } });
  return NextResponse.json(template, { status: 201 });
}
