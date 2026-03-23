import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
  });

  if (!instance || instance.licenseeId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!["PENDING", "IN_PROGRESS"].includes(instance.status)) {
    return NextResponse.json({ error: "Instance is not editable" }, { status: 400 });
  }

  const { fields } = await req.json();

  await prisma.instanceField.deleteMany({ where: { instanceId: params.id } });

  const fieldRecords = Object.entries(fields as Record<string, string>).map(
    ([key, value]) => ({
      instanceId: params.id,
      fieldKey: key,
      fieldValue: String(value),
      validatedAt: new Date(),
    })
  );

  await prisma.instanceField.createMany({ data: fieldRecords });

  if (instance.status === "PENDING") {
    await prisma.instance.update({
      where: { id: params.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json({ success: true });
}
