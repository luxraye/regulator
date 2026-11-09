import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compileInstance } from "@/lib/instance-engine/compiler";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import type { InstanceDefinition } from "@/lib/instance-engine/types";

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/instances-public/[slug]
 * Returns public competition instance details with timeline, prizes, rules, and FAQ.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;

    if (slug === "ceda-hackathon-2026") {
      await ensureFlagshipInstance(prisma);
    }

    const instance = await prisma.instance.findUnique({
      where: { slug },
      include: {
        partner: true,
        versions: {
          orderBy: { version: "desc" },
          take: 3,
          select: { version: true, rulesHash: true, reason: true, createdAt: true },
        },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    const definition = instance.definition as unknown as InstanceDefinition;
    const compiled = compileInstance(definition);

    return NextResponse.json({
      instance: {
        id: instance.id,
        name: instance.name,
        slug: instance.slug,
        status: instance.status,
        rulesHash: instance.rulesHash,
        opensAt: instance.opensAt,
        closesAt: instance.closesAt,
        partner: instance.partner,
      },
      definition: {
        meta: definition.meta,
        timeline: definition.timeline,
        eligibility: definition.eligibility,
        team: definition.team,
        rubric: {
          criteria: definition.rubric?.criteria ?? [],
          blind: definition.rubric?.blind,
        },
        channels: {
          faqs: definition.channels?.faqs ?? [],
          supportContacts: definition.channels?.supportContacts ?? [],
          liveChat: definition.channels?.liveChat,
        },
      },
      compiled,
      latestVersion: instance.versions[0]?.version ?? 1,
    });
  } catch (error) {
    console.error("GET /api/instances-public/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch instance" }, { status: 500 });
  }
}
