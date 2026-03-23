import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileKey = formData.get("fileKey") as string;

  if (!file || !fileKey) {
    return NextResponse.json({ error: "Missing file or fileKey" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const serverHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const uploadDir = path.join(process.cwd(), "uploads", params.id);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const storagePath = path.join(uploadDir, `${fileKey}${ext}`);
  await writeFile(storagePath, buffer);

  await prisma.instanceFile.upsert({
    where: {
      id: `${params.id}-${fileKey}`,
    },
    update: {
      fileName: file.name,
      fileExtension: ext,
      fileSize: buffer.length,
      clientHash: serverHash,
      serverHash,
      storagePath,
    },
    create: {
      id: `${params.id}-${fileKey}`,
      instanceId: params.id,
      fileName: file.name,
      fileExtension: ext,
      fileSize: buffer.length,
      clientHash: serverHash,
      serverHash,
      storagePath,
    },
  });

  return NextResponse.json({ hash: serverHash, size: buffer.length });
}
