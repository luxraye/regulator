import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/partner
 * Returns profile, branding colors, and metrics for the caller's partner organization.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedId = searchParams.get("id");

    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && requestedId) {
      partnerId = requestedId;
    }

    if (!partnerId) {
      // Default to CEDA partner if no partnerId is associated
      const cedaPartner = await prisma.partner.findUnique({ where: { slug: "ceda" } });
      if (cedaPartner) partnerId = cedaPartner.id;
    }

    if (!partnerId) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        _count: {
          select: {
            instances: true,
            users: true,
            apiKeys: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner organization not found" }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    console.error("GET /api/partner error:", error);
    return NextResponse.json({ error: "Failed to fetch partner data" }, { status: 500 });
  }
}

/**
 * PUT /api/partner
 * Updates partner branding, colors, and organization profile.
 */
export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, logoUrl, primaryColor, secondaryColor } = body;

    let targetId = user.partnerId;
    if (user.role === "SUPERADMIN" && id) {
      targetId = id;
    }

    if (!targetId) {
      return NextResponse.json({ error: "No partner specified" }, { status: 400 });
    }

    const updated = await prisma.partner.update({
      where: { id: targetId },
      data: {
        name: name ? String(name).trim() : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
      },
    });

    await audit(user.id, "UPDATE_PARTNER_BRANDING", {
      metadata: {
        partnerId: updated.id,
        partnerName: updated.name,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
      },
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error) {
    console.error("PUT /api/partner error:", error);
    return NextResponse.json({ error: "Failed to update partner branding" }, { status: 500 });
  }
}
