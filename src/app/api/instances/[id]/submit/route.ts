import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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
    include: { files: true, fields: true },
  });

  if (!instance || instance.licenseeId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!["PENDING", "IN_PROGRESS"].includes(instance.status)) {
    return NextResponse.json(
      { error: "Instance cannot be submitted in current state" },
      { status: 400 }
    );
  }

  const fileHashes = instance.files.map((f) => ({
    fileName: f.fileName,
    hash: f.serverHash,
  }));

  const submissionJwt = jwt.sign(
    {
      instanceId: instance.id,
      licenseeId: instance.licenseeId,
      submittedAt: new Date().toISOString(),
      fileHashes,
      fieldCount: instance.fields.length,
    },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: "100y" }
  );

  const updated = await prisma.instance.update({
    where: { id: params.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      submissionJwt,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: "INSTANCE_SUBMITTED",
      instanceId: params.id,
      metadata: { fileCount: fileHashes.length, fieldCount: instance.fields.length },
    },
  });

  return NextResponse.json({ success: true, submissionJwt });
}
