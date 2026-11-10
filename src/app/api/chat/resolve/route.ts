import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/resolve
 * Marks a consultation session as resolved.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["CONSULTANT", "ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId } = body;

    const resolved = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    await audit(user.id, "RESOLVE_CHAT_SESSION", {
      metadata: { sessionId, resolvedAt: resolved.resolvedAt },
    });

    return NextResponse.json({ success: true, session: resolved });
  } catch (error) {
    console.error("POST /api/chat/resolve error:", error);
    return NextResponse.json({ error: "Failed to resolve chat session" }, { status: 500 });
  }
}
