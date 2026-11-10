import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { verifyAuditChain } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/audit/verify
 * Recomputes the entire audit log hash chain and pinpoints any breaks or tampering.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instanceId = searchParams.get("instanceId") || undefined;

    const result = await verifyAuditChain({ instanceId });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("GET /api/audit/verify error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify audit chain" }, { status: 500 });
  }
}
