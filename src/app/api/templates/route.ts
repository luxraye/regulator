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
      status: true,
      opensAt: true,
      closesAt: true,
      fundingSummary: true,
      _count: { select: { instances: true } },
    },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(["ADMIN", "SUPERADMIN"]);
  if (error) return error;

  const { code, name, description, scale, dataType, schema, closesAt, fundingSummary, status } =
    (await req.json().catch(() => ({}))) ?? {};
  if (!code || !name || !scale || !dataType || !schema || !closesAt) return badRequest("Missing required fields");
  const closes = new Date(closesAt);
  if (Number.isNaN(closes.getTime()) || closes < new Date()) return badRequest("Closing date must be in the future");
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
    data: {
      code,
      name,
      description: description || null,
      scale,
      dataType,
      schema: parsed.schema as object,
      closesAt: closes,
      fundingSummary: fundingSummary || null,
      status: status === "DRAFT" ? "DRAFT" : "OPEN",
      createdById: user.id,
    },
  });
  await audit(user.id, "CALL_CREATED", { metadata: { code } });
  return NextResponse.json(template, { status: 201 });
}

/** Open or close a call: { id, status }. */
export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser(["ADMIN", "SUPERADMIN"]);
  if (error) return error;
  const { id, status } = (await req.json().catch(() => ({}))) ?? {};
  if (!id || !["DRAFT", "OPEN", "CLOSED"].includes(status)) return badRequest("Expected { id, status }");
  const updated = await prisma.template.update({ where: { id }, data: { status }, select: { id: true, code: true, status: true } });
  await audit(user.id, `CALL_${status}`, { metadata: { code: updated.code } });
  return NextResponse.json(updated);
}
