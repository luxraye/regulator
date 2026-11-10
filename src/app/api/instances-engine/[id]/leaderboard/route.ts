import { NextRequest, NextResponse } from "next/server";
import { computeLeaderboard } from "@/lib/instance-engine/leaderboard";
import { getSessionUser } from "@/lib/session";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/instances-engine/[id]/leaderboard
 * Recomputes the instance leaderboard from evaluation scores & rubric weights.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const leaderboard = await computeLeaderboard(id);

    if (!leaderboard) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error("GET /api/instances-engine/[id]/leaderboard error:", error);
    return NextResponse.json({ error: error.message || "Failed to compute leaderboard" }, { status: 500 });
  }
}
