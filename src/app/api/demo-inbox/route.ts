import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { INBOX_COOKIE_NAME, maskSensitiveComms } from "@/lib/comms/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/demo-inbox
 * Scoped communications inbox:
 * - Anonymous / regular users only see messages matching their session cookie (unmasked).
 * - SUPERADMIN can see all messages (masked to prevent token harvesting).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const to = searchParams.get("to");

    const sessionUser = await getSessionUser();
    const isSuperAdmin = sessionUser?.role === "SUPERADMIN";

    const sessionCookie = req.cookies.get(INBOX_COOKIE_NAME)?.value;

    // Non-superadmin users without a session cookie cannot see any messages
    if (!isSuperAdmin && !sessionCookie) {
      return NextResponse.json({ messages: [] });
    }

    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (to) {
      where.to = { contains: to, mode: "insensitive" };
    }

    const messages = await prisma.demoInboxMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (isSuperAdmin) {
      // Superadmin sees all messages, but tokens & OTPs are masked for safety
      return NextResponse.json({
        messages: messages.map(maskSensitiveComms),
      });
    }

    // Normal user / judge sees only messages matching their browser's inboxSessionId
    const scoped = messages.filter((m) => {
      const meta = m.metadata as Record<string, unknown> | null;
      return meta?.inboxSessionId === sessionCookie;
    });

    return NextResponse.json({ messages: scoped });
  } catch (error) {
    console.error("GET /api/demo-inbox error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox messages" }, { status: 500 });
  }
}

/**
 * DELETE /api/demo-inbox
 * Clears demo inbox messages — SUPERADMIN only.
 */
export async function DELETE() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Superadmin role required to purge communications." },
        { status: 403 }
      );
    }

    await prisma.demoInboxMessage.deleteMany();
    return NextResponse.json({ success: true, message: "Demo inbox cleared successfully" });
  } catch (error) {
    console.error("DELETE /api/demo-inbox error:", error);
    return NextResponse.json({ error: "Failed to clear demo inbox" }, { status: 500 });
  }
}
