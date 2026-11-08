import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, notFound } from "@/lib/session";
import { canReadInstance } from "@/lib/instances";
import { verifyHash } from "@/lib/hash";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Download an uploaded file. The bytes are re-hashed on the way out. */
export async function GET(_req: NextRequest, { params }: { params: { id: string; fileId: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const file = await prisma.instanceFile.findUnique({
    where: { id: params.fileId },
    include: { instance: { select: { id: true, innovatorId: true } } },
  });
  if (!file || file.instanceId !== params.id) return notFound();
  if (!(await canReadInstance(user, file.instance))) return notFound();
  const isStaff = user.id !== file.instance.innovatorId;

  const content = Buffer.from(file.content);
  const intact = verifyHash(content, file.serverHash);
  if (isStaff) {
    await audit(user.id, "FILE_DOWNLOADED", { instanceId: file.instanceId, metadata: { fileKey: file.fileKey, intact } });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Length": String(content.length),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      "X-Content-SHA256": file.serverHash,
      "X-Integrity-Verified": String(intact),
      "Cache-Control": "private, no-store",
    },
  });
}
