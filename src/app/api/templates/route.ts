import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      scale: true,
      dataType: true,
      schema: true,
      createdAt: true,
    },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { code, name, description, scale, dataType, schema } = body;

  if (!code || !name || !scale || !dataType || !schema) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: {
      code,
      name,
      description,
      scale,
      dataType,
      schema,
      createdById: (session.user as any).id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
