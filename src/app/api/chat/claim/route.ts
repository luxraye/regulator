import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/claim
 * Consultant claims a waiting inquiry from the queue.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["CONSULTANT", "ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId } = body;

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        consultantId: user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("POST /api/chat/claim error:", error);
    return NextResponse.json({ error: "Failed to claim chat session" }, { status: 500 });
  }
}
