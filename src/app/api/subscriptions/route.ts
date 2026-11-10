import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscriptions
 * Returns active alert subscriptions for the logged-in user.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        instance: { select: { id: true, name: true, slug: true } },
        entry: { select: { id: true, title: true, referenceCode: true } },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Creates or updates an alert subscription (EMAIL, SMS, IN_APP) for an Instance or Entry.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { instanceId, entryId, channel } = body;

    const selectedChannel = (channel as "EMAIL" | "SMS" | "IN_APP") || "EMAIL";

    // Verify channel prerequisites
    if (selectedChannel === "SMS") {
      const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true } });
      if (!fullUser?.phone) {
        return NextResponse.json({ error: "A verified phone number is required for SMS alerts" }, { status: 400 });
      }
    }

    // Check if subscription already exists
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        instanceId: instanceId || null,
        entryId: entryId || null,
        channel: selectedChannel,
      },
    });

    if (existing) {
      // Toggle active status if exists
      const updated = await prisma.subscription.update({
        where: { id: existing.id },
        data: { active: !existing.active },
      });
      return NextResponse.json({ success: true, subscription: updated });
    }

    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        instanceId: instanceId || null,
        entryId: entryId || null,
        channel: selectedChannel,
        active: true,
      },
    });

    await audit(user.id, "CREATE_ALERT_SUBSCRIPTION", {
      instanceId: instanceId || undefined,
      metadata: { channel: selectedChannel, subscriptionId: created.id },
    });

    return NextResponse.json({ success: true, subscription: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
