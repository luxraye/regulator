import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticatePartnerRequest } from "@/lib/api-v1/auth";

interface RouteParams {
  params: { id: string };
}

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/instances/[id]/entries
 * Lists all entries lodged inside a partner's competition instance.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const partnerAuth = await authenticatePartnerRequest(req);
  if (!partnerAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const instance = await prisma.instance.findFirst({
      where: {
        id,
        partnerId: partnerAuth.partnerId,
      },
    });

    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    const entries = await prisma.entry.findMany({
      where: { instanceId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        referenceCode: true,
        title: true,
        status: true,
        score: true,
        rank: true,
        awardAmount: true,
        createdAt: true,
        submittedAt: true,
        innovator: {
          select: {
            name: true,
            email: true,
            organizationName: true,
          },
        },
        _count: {
          select: {
            files: true,
            evaluations: true,
            checkResults: true,
          },
        },
      },
    });

    return NextResponse.json({
      instanceId: instance.id,
      instanceName: instance.name,
      totalEntries: entries.length,
      entries,
    });
  } catch (error: any) {
    console.error("GET /api/v1/instances/[id]/entries error:", error);
    return NextResponse.json({ error: "Failed to list entries" }, { status: 500 });
  }
}
