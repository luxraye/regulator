import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/messages?sessionId=...
 * Returns sequential message history for a chat session.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Access control: only participants or staff may read
    const isParticipant = session.userId === user.id || session.consultantId === user.id;
    const isStaff = ["CONSULTANT", "ADMIN", "SUPERADMIN"].includes(user.role);
    if (!isParticipant && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ session, messages });
  } catch (error) {
    console.error("GET /api/chat/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

/**
 * POST /api/chat/messages
 * Sends a message in a chat session.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, message } = body;

    if (!sessionId || !message || !String(message).trim()) {
      return NextResponse.json({ error: "Session ID and message text are required" }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isConsultantResponse = ["CONSULTANT", "ADMIN", "SUPERADMIN"].includes(user.role);
    const updates: any = {};

    // Track first response time for consultant analytics
    if (isConsultantResponse && !session.firstResponseAt) {
      updates.firstResponseAt = new Date();
      if (!session.consultantId) {
        updates.consultantId = user.id;
      }
      if (session.status === "WAITING") {
        updates.status = "ACTIVE";
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: updates,
      });
    }

    const created = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderId: user.id,
        senderRole: user.role,
        body: String(message).trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, message: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
