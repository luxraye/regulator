import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { createPartnerApiKey } from "@/lib/api-v1/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/partner/keys
 * Lists API keys owned by the partner organization.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && searchParams.get("partnerId")) {
      partnerId = searchParams.get("partnerId");
    }

    if (!partnerId) {
      return NextResponse.json({ keys: [] });
    }

    const keys = await prisma.apiKey.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("GET /api/partner/keys error:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

/**
 * POST /api/partner/keys
 * Creates a new hashed API key for the partner organization.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && body.partnerId) {
      partnerId = body.partnerId;
    }

    if (!partnerId) {
      return NextResponse.json({ error: "No partner specified" }, { status: 400 });
    }

    const keyName = (name && String(name).trim()) || "Production Key";
    const generated = await createPartnerApiKey(partnerId, keyName, user.id);

    await audit(user.id, "CREATE_PARTNER_API_KEY", {
      metadata: {
        partnerId,
        keyId: generated.id,
        keyPrefix: generated.keyPrefix,
        name: keyName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        apiKey: generated.apiKey,
        keyPrefix: generated.keyPrefix,
        id: generated.id,
        message: "API key generated. Store it safely; it will not be displayed again.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/partner/keys error:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}
