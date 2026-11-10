import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticatePartnerRequest } from "@/lib/api-v1/auth";

interface RouteParams {
  params: { id: string };
}

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/entries/[id]
 * Retrieves status, check results, score, and submission details for a specific entry.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const partnerAuth = await authenticatePartnerRequest(req);
  if (!partnerAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        instance: { select: { id: true, name: true, slug: true, partnerId: true } },
        innovator: { select: { id: true, name: true, email: true, organizationName: true } },
        team: { include: { members: true } },
        files: { select: { id: true, fileKey: true, fileName: true, fileSize: true, serverHash: true } },
        fields: { select: { fieldKey: true, fieldValue: true } },
        checkResults: { select: { checkKey: true, name: true, category: true, status: true, detail: true } },
      },
    });

    if (!entry || entry.instance.partnerId !== partnerAuth.partnerId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      entry: {
        id: entry.id,
        referenceCode: entry.referenceCode,
        title: entry.title,
        status: entry.status,
        score: entry.score,
        rank: entry.rank,
        awardAmount: entry.awardAmount,
        submittedAt: entry.submittedAt,
        dataHash: entry.dataHash,
        submissionJwt: entry.submissionJwt,
        instance: entry.instance,
        innovator: entry.innovator,
        team: entry.team,
        files: entry.files,
        fields: entry.fields,
        checkResults: entry.checkResults,
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/entries/[id] error:", error);
    return NextResponse.json({ error: "Failed to retrieve entry" }, { status: 500 });
  }
}
