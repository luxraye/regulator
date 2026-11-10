import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticatePartnerRequest } from "@/lib/api-v1/auth";
import { validateInstanceDefinition } from "@/lib/instance-engine/validator";
import { computeRulesHash } from "@/lib/instance-engine/canonical";
import { FLAGSHIP_CEDA_HACKATHON_2026 } from "@/lib/instance-engine/flagship";
import { BLUEPRINT_CATALOG } from "@/lib/instance-engine/blueprints";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/instances
 * Lists competition instances owned by the authenticated Partner.
 */
export async function GET(req: NextRequest) {
  const partnerAuth = await authenticatePartnerRequest(req);
  if (!partnerAuth) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key. Use Authorization: Bearer ceda_live_..." },
      { status: 401 }
    );
  }

  try {
    const instances = await prisma.instance.findMany({
      where: { partnerId: partnerAuth.partnerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        rulesHash: true,
        opensAt: true,
        closesAt: true,
        createdAt: true,
        _count: {
          select: { entries: true },
        },
      },
    });

    return NextResponse.json({
      partner: { id: partnerAuth.partnerId, name: partnerAuth.partnerName },
      instances,
    });
  } catch (error: any) {
    console.error("GET /api/v1/instances error:", error);
    return NextResponse.json({ error: "Failed to list instances" }, { status: 500 });
  }
}

/**
 * POST /api/v1/instances
 * Creates a new competition instance under the authenticated Partner.
 */
export async function POST(req: NextRequest) {
  const partnerAuth = await authenticatePartnerRequest(req);
  if (!partnerAuth) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { blueprintKey, customDefinition } = body;

    let definition: InstanceDefinition;

    if (customDefinition) {
      const val = validateInstanceDefinition(customDefinition);
      if (!val.valid) {
        return NextResponse.json(
          { error: "Invalid instance definition", details: val.errors },
          { status: 400 }
        );
      }
      definition = customDefinition;
    } else if (blueprintKey) {
      const bp = BLUEPRINT_CATALOG.find((b) => b.key === blueprintKey);
      if (!bp) {
        return NextResponse.json({ error: `Unknown blueprint: ${blueprintKey}` }, { status: 400 });
      }
      definition = JSON.parse(JSON.stringify(bp.definition));
    } else {
      definition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    }

    definition.meta.partnerSlug = partnerAuth.partnerSlug;

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
        partnerId: partnerAuth.partnerId,
        name: definition.meta.name,
        slug,
        rulesHash,
        definition: definition as unknown as Prisma.InputJsonValue,
        status: "DRAFT",
        opensAt,
        closesAt,
      },
    });

    await audit(`api_key:${partnerAuth.keyPrefix}`, "API_CREATE_INSTANCE", {
      instanceId: instance.id,
      metadata: { name: instance.name, slug: instance.slug, partnerId: partnerAuth.partnerId },
    });

    return NextResponse.json({ success: true, instance }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/v1/instances error:", error);
    return NextResponse.json({ error: "Failed to create instance" }, { status: 500 });
  }
}
