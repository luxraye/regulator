import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

/**
 * DELETE /api/partner/keys/[id]
 * Revokes an API key.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.apiKey.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    if (user.role === "PARTNER_ADMIN" && user.partnerId && existing.partnerId !== user.partnerId) {
      return NextResponse.json({ error: "Forbidden: You may only revoke your partner's API keys" }, { status: 403 });
    }

    const revoked = await prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await audit(user.id, "REVOKE_PARTNER_API_KEY", {
      metadata: {
        keyId: revoked.id,
        partnerId: revoked.partnerId,
        keyPrefix: revoked.keyPrefix,
      },
    });

    return NextResponse.json({ success: true, message: "API key revoked successfully" });
  } catch (error) {
    console.error("DELETE /api/partner/keys/[id] error:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
