import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/sessions
 * Returns user's chat sessions, or consultant's active / waiting queue.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "queue" | "my" | "all"

    let where: any = {};

    if (user.role === "CONSULTANT" || user.role === "ADMIN" || user.role === "SUPERADMIN") {
      if (filter === "queue") {
        where = { status: "WAITING" };
      } else if (filter === "my") {
        where = { consultantId: user.id, status: "ACTIVE" };
      } else {
        where = { status: { in: ["WAITING", "ACTIVE"] } };
      }
    } else {
      where = { userId: user.id };
    }

    const sessions = await prisma.chatSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, organizationName: true } },
        consultant: { select: { id: true, name: true, email: true } },
        instance: { select: { id: true, name: true, slug: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/chat/sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

/**
 * POST /api/chat/sessions
 * Initiates a new chat session with a CEDA consultant.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { instanceId, subject, initialMessage } = body;

    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        instanceId: instanceId || null,
        subject: subject || "Innovation Consultation",
        status: "WAITING",
        messages: initialMessage
          ? {
              create: {
                senderId: user.id,
                senderRole: user.role,
                body: initialMessage,
              },
            }
          : undefined,
      },
      include: {
        messages: true,
        instance: { select: { id: true, name: true, slug: true } },
      },
    });

    await audit(user.id, "START_CHAT_SESSION", {
      instanceId: instanceId || undefined,
      metadata: { sessionId: session.id, subject: session.subject },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat/sessions error:", error);
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}
