import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { publishInstance } from "@/lib/instance-engine/service";

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/instances-engine/[id]/publish
 * Validates, seals, and publishes an instance definition.
 * Generates canonical rulesHash fingerprint and freezes snapshot.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (user.role === "PARTNER_ADMIN" && user.partnerId) {
      const inst = await prisma.instance.findUnique({ where: { id }, select: { partnerId: true } });
      if (inst && inst.partnerId !== user.partnerId) {
        return NextResponse.json({ error: "Forbidden: You may only publish your partner's instances" }, { status: 403 });
      }
    }

    const result = await publishInstance(id, user.id);

    if (!result.success) {
      return NextResponse.json({
        error: result.errors?.join(", ") || "Publishing failed",
        errors: result.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      rulesHash: result.rulesHash,
      status: result.status,
    });
  } catch (error) {
    console.error("POST /api/instances-engine/[id]/publish error:", error);
    return NextResponse.json({ error: "Failed to publish instance" }, { status: 500 });
  }
}
