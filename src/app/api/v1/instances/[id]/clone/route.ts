import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticatePartnerRequest } from "@/lib/api-v1/auth";
import { computeRulesHash } from "@/lib/instance-engine/canonical";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/instances/[id]/clone
 * Deep clones an instance for the authenticated Partner.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const partnerAuth = await authenticatePartnerRequest(req);
  if (!partnerAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const source = await prisma.instance.findFirst({
      where: {
        id,
        partnerId: partnerAuth.partnerId,
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Source instance not found" }, { status: 404 });
    }

    const sourceDef = source.definition as unknown as InstanceDefinition;
    const clonedDef: InstanceDefinition = JSON.parse(JSON.stringify(sourceDef));

    const newSlug = `${source.slug}-clone-${Date.now().toString(36)}`;
    const newName = `${source.name} (Clone)`;

    clonedDef.meta.name = newName;
    clonedDef.meta.slug = newSlug;

    const rulesHash = computeRulesHash(clonedDef);

    const cloned = await prisma.instance.create({
      data: {
        partnerId: partnerAuth.partnerId,
        blueprintId: source.blueprintId,
        name: newName,
        slug: newSlug,
        rulesHash,
        definition: clonedDef as unknown as Prisma.InputJsonValue,
        status: "DRAFT",
        opensAt: source.opensAt,
        closesAt: source.closesAt,
      },
    });

    await audit(`api_key:${partnerAuth.keyPrefix}`, "API_CLONE_INSTANCE", {
      instanceId: cloned.id,
      metadata: { sourceId: source.id, newSlug },
    });

    return NextResponse.json({ success: true, instance: cloned }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/v1/instances/[id]/clone error:", error);
    return NextResponse.json({ error: "Failed to clone instance" }, { status: 500 });
  }
}
