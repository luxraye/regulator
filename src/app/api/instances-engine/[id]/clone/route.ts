import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { computeRulesHash } from "@/lib/instance-engine/canonical";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/instances-engine/[id]/clone
 * Clones an existing instance into a fresh editable DRAFT instance.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const source = await prisma.instance.findUnique({
      where: { id },
      include: { partner: true },
    });

    if (!source) {
      return NextResponse.json({ error: "Source instance not found" }, { status: 404 });
    }

    const sourceDef = source.definition as unknown as InstanceDefinition;
    const clonedDef: InstanceDefinition = JSON.parse(JSON.stringify(sourceDef));

    const newSlug = `${source.slug}-copy-${Date.now().toString(36)}`;
    const newName = `${source.name} (Copy)`;

    clonedDef.meta.name = newName;
    clonedDef.meta.slug = newSlug;

    const rulesHash = computeRulesHash(clonedDef);

    const cloned = await prisma.instance.create({
      data: {
        partnerId: source.partnerId,
        blueprintId: source.blueprintId,
        name: newName,
        slug: newSlug,
        rulesHash,
        definition: clonedDef as unknown as Prisma.InputJsonValue,
        status: "DRAFT",
        opensAt: source.opensAt,
        closesAt: source.closesAt,
      },
      include: { partner: true },
    });

    await audit(user.id, "CLONE_INSTANCE", {
      instanceId: cloned.id,
      metadata: { sourceId: id, sourceSlug: source.slug, newSlug },
    });

    return NextResponse.json({ success: true, instance: cloned });
  } catch (error) {
    console.error("POST /api/instances-engine/[id]/clone error:", error);
    return NextResponse.json({ error: "Failed to clone instance" }, { status: 500 });
  }
}
