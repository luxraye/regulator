import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/demo-inbox
 * Returns real-time delivered communication items (email and SMS).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const to = searchParams.get("to");

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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/demo-inbox error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox messages" }, { status: 500 });
  }
}

/**
 * DELETE /api/demo-inbox
 * Clears demo inbox messages.
 */
export async function DELETE() {
  try {
    await prisma.demoInboxMessage.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/demo-inbox error:", error);
    return NextResponse.json({ error: "Failed to clear demo inbox" }, { status: 500 });
  }
}
