import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound } from "@/lib/session";
import { isEditable, validateFile } from "@/lib/instance-schema";
import { schemaOf } from "@/lib/instances";
import { sha256 } from "@/lib/hash";

export const dynamic = "force-dynamic";

/**
 * Upload one required file. The browser sends its own SHA-256 (clientHash);
 * the server hashes the bytes it received and refuses the file if they differ.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(["INNOVATOR"]);
  if (error) return error;

  const instance = await prisma.instance.findUnique({ where: { id: params.id }, include: { template: true } });
  if (!instance || instance.innovatorId !== user.id) return notFound();
  if (!isEditable(instance.status)) return badRequest("This instance is locked and can no longer be edited");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const fileKey = form?.get("fileKey");
  const clientHash = String(form?.get("clientHash") ?? "").toLowerCase();

  if (!(file instanceof File) || typeof fileKey !== "string") return badRequest("Missing file or fileKey");
  if (!/^[a-f0-9]{64}$/.test(clientHash)) return badRequest("Missing or malformed clientHash (SHA-256 hex)");

  const requirement = schemaOf(instance.template).required_files.find((rf) => rf.key === fileKey);
  if (!requirement) return badRequest(`This template does not ask for a file called "${fileKey}"`);

  const problem = validateFile(requirement, file.name, file.size);
  if (problem) return badRequest(problem);

  const buffer = Buffer.from(await file.arrayBuffer());
  const serverHash = sha256(buffer);

  if (serverHash !== clientHash) {
    return NextResponse.json(
      {
        error: "Integrity check failed: the file changed between your browser and our server. Please upload it again.",
        clientHash,
        serverHash,
      },
      { status: 409 }
    );
  }

  const data = {
    fileName: file.name.slice(0, 255),
    fileExtension: path.extname(file.name).toLowerCase(),
    mimeType: file.type || "application/octet-stream",
    fileSize: buffer.length,
    clientHash,
    serverHash,
    content: buffer,
    uploadedAt: new Date(),
  };

  const saved = await prisma.instanceFile.upsert({
    where: { instanceId_fileKey: { instanceId: instance.id, fileKey } },
    update: data,
    create: { ...data, instanceId: instance.id, fileKey },
    select: { id: true, fileKey: true, fileName: true, fileSize: true, serverHash: true },
  });

  return NextResponse.json({ ...saved, hash: serverHash, verified: true });
}
