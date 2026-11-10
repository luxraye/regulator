import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard } from "@/lib/instance-engine/leaderboard";

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/instances-public/[slug]/leaderboard
 * Public verifiable leaderboard endpoint for a competition challenge.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const instance = await prisma.instance.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    const leaderboard = await computeLeaderboard(instance.id);
    if (!leaderboard) {
      return NextResponse.json({ error: "Could not compute leaderboard" }, { status: 500 });
    }

    return NextResponse.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error("GET /api/instances-public/[slug]/leaderboard error:", error);
    return NextResponse.json({ error: error.message || "Failed to compute leaderboard" }, { status: 500 });
  }
}
