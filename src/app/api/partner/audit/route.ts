import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { verifyAuditChain } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/partner/audit
 * Returns the tamper-evident audit trail scoped strictly to the partner organization.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && searchParams.get("partnerId")) {
      partnerId = searchParams.get("partnerId");
    }

    if (!partnerId) {
      return NextResponse.json({ logs: [], total: 0, chainStatus: null });
    }

    // Find all instance IDs owned by this partner
    const partnerInstances = await prisma.instance.findMany({
      where: { partnerId },
      select: { id: true },
    });
    const instanceIds = partnerInstances.map((i) => i.id);

    // Fetch audit records associated with this partner
    const [logs, total, chainStatus] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          OR: [
            { instanceId: { in: instanceIds } },
            { actor: { partnerId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
          instance: { select: { id: true, name: true, slug: true } },
          entry: { select: { id: true, title: true, referenceCode: true } },
        },
      }),
      prisma.auditLog.count({
        where: {
          OR: [
            { instanceId: { in: instanceIds } },
            { actor: { partnerId } },
          ],
        },
      }),
      verifyAuditChain(),
    ]);

    return NextResponse.json({ logs, total, chainStatus });
  } catch (error) {
    console.error("GET /api/partner/audit error:", error);
    return NextResponse.json({ error: "Failed to fetch partner audit trail" }, { status: 500 });
  }
}
