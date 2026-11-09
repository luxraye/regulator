import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { runFullPreflight } from "@/lib/guards";

export const dynamic = "force-dynamic";

/**
 * GET & POST /api/instances/[id]/preflight
 * Runs participant pre-flight checks: file safety, secret scanning, dependency CVEs,
 * live HTTPS URL, repo URL, eligibility, and faithfulness completeness.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entry = await prisma.entry.findUnique({
      where: { id: params.id },
      select: { id: true, innovatorId: true },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Allow innovators to run pre-flight on their own entry, or admins/evaluators
    if (entry.innovatorId !== user.id && !["ADMIN", "SUPERADMIN", "EVALUATOR", "ADJUDICATOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const report = await runFullPreflight({ entryId: params.id });
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("GET /api/instances/[id]/preflight error:", error);
    return NextResponse.json({ error: error.message || "Preflight failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return GET(req, { params });
}
