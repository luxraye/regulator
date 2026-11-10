import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

/**
 * DELETE /api/subscriptions/[id]
 * One-click unsubscription.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.subscription.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.subscription.delete({ where: { id } });

    await audit(user.id, "DELETE_ALERT_SUBSCRIPTION", {
      metadata: { subscriptionId: id, channel: existing.channel },
    });

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("DELETE /api/subscriptions/[id] error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
