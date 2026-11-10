import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConsultingHoursStatus } from "@/lib/chat/hours";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/status
 * Returns current consulting hours availability and queue depth.
 */
export async function GET() {
  try {
    const hoursStatus = getConsultingHoursStatus();

    // Check count of active waiting queue
    const waitingQueueCount = await prisma.chatSession.count({
      where: { status: "WAITING" },
    });

    // Check count of available consultants
    const activeConsultants = await prisma.user.count({
      where: { role: "CONSULTANT" },
    });

    return NextResponse.json({
      ...hoursStatus,
      waitingQueueCount,
      activeConsultants,
    });
  } catch (error) {
    console.error("GET /api/chat/status error:", error);
    return NextResponse.json({ error: "Failed to fetch chat status" }, { status: 500 });
  }
}
