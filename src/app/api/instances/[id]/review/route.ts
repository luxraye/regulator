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

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, reviewNotes } = await req.json();

  if (!["APPROVED", "FLAGGED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  if (instance.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: "Can only review submitted instances" },
      { status: 400 }
    );
  }

  const updated = await prisma.instance.update({
    where: { id: params.id },
    data: {
      status,
      reviewNotes,
      reviewedById: (session.user as any).id,
      reviewedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: `INSTANCE_${status}`,
      instanceId: params.id,
      metadata: { reviewNotes },
    },
  });

  await prisma.notification.create({
    data: {
      userId: instance.licenseeId,
      title: `Instance ${status.toLowerCase()}`,
      body: reviewNotes || `Your submission has been ${status.toLowerCase()}.`,
    },
  });

  return NextResponse.json(updated);
}
