import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { validateInstanceDefinition } from "@/lib/instance-engine/validator";
import { computeRulesHash } from "@/lib/instance-engine/canonical";
import { FLAGSHIP_CEDA_HACKATHON_2026, ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import { BLUEPRINT_CATALOG } from "@/lib/instance-engine/blueprints";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import { InstanceLifecycleStatus, Prisma } from "@prisma/client";

/**
 * GET /api/instances-engine
 * Lists all competition instances with entry counts and partner details.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure flagship instance is available
    await ensureFlagshipInstance(prisma);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const partnerSlug = searchParams.get("partner");
    const search = searchParams.get("search");

    const where: Prisma.InstanceWhereInput = {};
    if (status && status !== "ALL") {
      where.status = status as InstanceLifecycleStatus;
    }
    if (partnerSlug) {
      where.partner = { slug: partnerSlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const instances = await prisma.instance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        partner: { select: { id: true, name: true, slug: true, logoUrl: true } },
        versions: {
          orderBy: { version: "desc" },
          take: 1,
          select: { version: true, rulesHash: true, createdAt: true },
        },
        _count: {
          select: {
            entries: true,
            roles: true,
          },
        },
      },
    });

    return NextResponse.json({ instances });
  } catch (error) {
    console.error("GET /api/instances-engine error:", error);
    return NextResponse.json({ error: "Failed to fetch instances" }, { status: 500 });
  }
}

/**
 * POST /api/instances-engine
 * Creates a new competition instance in DRAFT status.
 * Body can specify blueprintKey ("flagship-hackathon", "agritech-challenge", etc.) or a custom definition.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { blueprintKey, partnerSlug, customDefinition } = body;

    let definition: InstanceDefinition;

    if (customDefinition) {
      const val = validateInstanceDefinition(customDefinition);
      if (!val.valid) {
        return NextResponse.json({ error: "Invalid instance definition", details: val.errors }, { status: 400 });
      }
      definition = customDefinition;
    } else if (blueprintKey) {
      const bp = BLUEPRINT_CATALOG.find((b) => b.key === blueprintKey);
      if (!bp) {
        return NextResponse.json({ error: `Unknown blueprint: ${blueprintKey}` }, { status: 400 });
      }
      definition = JSON.parse(JSON.stringify(bp.definition));
    } else {
      // Default to Flagship Hackathon definition template
      definition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    }

    // Resolve Partner
    const pSlug = partnerSlug || definition.meta.partnerSlug || "ceda";
    let partner = await prisma.partner.findUnique({ where: { slug: pSlug } });
    if (!partner) {
      partner = await prisma.partner.findFirst();
      if (!partner) {
        partner = await prisma.partner.create({
          data: {
            name: "Citizen Entrepreneurial Development Agency",
            slug: "ceda",
            status: "ACTIVE",
          },
        });
      }
    }

    // Ensure unique slug
    let slug = definition.meta.slug || "new-instance";
    const existing = await prisma.instance.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
      definition.meta.slug = slug;
    }

    const rulesHash = computeRulesHash(definition);
    const opensAt = definition.timeline[0]?.start ? new Date(definition.timeline[0].start) : new Date();
    const closesAt = definition.timeline[definition.timeline.length - 1]?.end
      ? new Date(definition.timeline[definition.timeline.length - 1].end)
      : new Date(Date.now() + 30 * 86400000);

    const instance = await prisma.instance.create({
      data: {
        partnerId: partner.id,
        name: definition.meta.name,
        slug,
        rulesHash,
        definition: definition as unknown as Prisma.InputJsonValue,
        status: "DRAFT",
        opensAt,
        closesAt,
      },
      include: {
        partner: true,
      },
    });

    // Record audit entry
    await audit(user.id, "CREATE_INSTANCE", {
      instanceId: instance.id,
      metadata: { name: instance.name, slug: instance.slug, partner: partner.name },
    });

    return NextResponse.json({ success: true, instance }, { status: 201 });
  } catch (error) {
    console.error("POST /api/instances-engine error:", error);
    return NextResponse.json({ error: "Failed to create instance" }, { status: 500 });
  }
}
