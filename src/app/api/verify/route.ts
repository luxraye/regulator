import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, PANEL_ROLES } from "@/lib/session";
import { verifySubmission } from "@/lib/jwt-sign";
import { checkIntegrity } from "@/lib/instances";

export const dynamic = "force-dynamic";

/**
 * Staff verification tools.
 *  { token }  -> verify a submission receipt and re-check the stored instance
 *  { hash }   -> find which submitted file (if any) has this SHA-256
 */
export async function POST(req: NextRequest) {
  const { error } = await requireUser(PANEL_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));

  if (typeof body?.token === "string" && body.token.trim()) {
    const result = verifySubmission(body.token);
    let integrity = null;
    let matchesStored = false;
    if (result.payload?.instanceId) {
      const inst = await prisma.instance.findUnique({
        where: { id: result.payload.instanceId },
        select: { submissionJwt: true },
      });
      matchesStored = inst?.submissionJwt === body.token.trim();
      integrity = await checkIntegrity(result.payload.instanceId);
    }
    return NextResponse.json({ kind: "token", ...result, matchesStored, integrity });
  }

  if (typeof body?.hash === "string") {
    const hash = body.hash.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(hash)) return badRequest("Expected a 64-character SHA-256 hex string");
    const files = await prisma.instanceFile.findMany({
      where: { serverHash: hash },
      select: {
        fileName: true,
        fileKey: true,
        uploadedAt: true,
        instance: {
          select: {
            id: true,
            status: true,
            template: { select: { code: true, name: true } },
            innovator: { select: { organizationName: true } },
          },
        },
      },
    });
    return NextResponse.json({ kind: "hash", hash, matches: files });
  }

  return badRequest("Send { token } or { hash }");
}
