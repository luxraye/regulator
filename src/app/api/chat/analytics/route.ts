import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/analytics
 * Computes chat analytics report: volume, first response time, resolution rate,
 * busiest hours, and per-agent metrics.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !["CONSULTANT", "ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allSessions = await prisma.chatSession.findMany({
      include: {
        consultant: { select: { id: true, name: true, email: true } },
      },
    });

    const totalSessions = allSessions.length;
    const waitingSessions = allSessions.filter((s) => s.status === "WAITING").length;
    const activeSessions = allSessions.filter((s) => s.status === "ACTIVE").length;
    const resolvedSessions = allSessions.filter((s) => s.status === "RESOLVED").length;

    const resolutionRate = totalSessions > 0 ? Math.round((resolvedSessions / totalSessions) * 100) : 100;

    // First Response Time calculation
    const answeredSessions = allSessions.filter((s) => s.firstResponseAt !== null);
    let avgResponseTimeMinutes = 0;
    if (answeredSessions.length > 0) {
      const totalWaitMs = answeredSessions.reduce((acc, s) => {
        const wait = s.firstResponseAt!.getTime() - s.startedAt.getTime();
        return acc + Math.max(0, wait);
      }, 0);
      avgResponseTimeMinutes = Math.round((totalWaitMs / answeredSessions.length / 60000) * 10) / 10;
    }

    // Busiest Hours Breakdown (CAT timezone: UTC + 2)
    const hourCounts: Record<string, number> = {};
    for (let h = 9; h <= 16; h++) {
      hourCounts[`${h.toString().padStart(2, "0")}:00`] = 0;
    }

    for (const s of allSessions) {
      const catDate = new Date(s.startedAt.getTime() + 2 * 3600000);
      const h = catDate.getUTCHours();
      const label = `${h.toString().padStart(2, "0")}:00`;
      hourCounts[label] = (hourCounts[label] || 0) + 1;
    }

    const busiestHours = Object.entries(hourCounts).map(([hour, count]) => ({
      hour,
      sessions: count,
    }));

    // Per-Agent breakdown
    const agentMap: Record<string, { id: string; name: string; email: string; sessions: number; totalMinutes: number }> = {};
    for (const s of allSessions) {
      if (s.consultant) {
        const agentId = s.consultant.id;
        if (!agentMap[agentId]) {
          agentMap[agentId] = {
            id: agentId,
            name: s.consultant.name,
            email: s.consultant.email,
            sessions: 0,
            totalMinutes: 0,
          };
        }
        agentMap[agentId].sessions += 1;
        if (s.firstResponseAt) {
          const waitMin = (s.firstResponseAt.getTime() - s.startedAt.getTime()) / 60000;
          agentMap[agentId].totalMinutes += Math.max(0, waitMin);
        }
      }
    }

    const perAgent = Object.values(agentMap).map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      handledCount: a.sessions,
      avgFirstResponseMin: a.sessions > 0 ? Math.round((a.totalMinutes / a.sessions) * 10) / 10 : 0,
    }));

    return NextResponse.json({
      summary: {
        totalSessions,
        waitingSessions,
        activeSessions,
        resolvedSessions,
        resolutionRate,
        avgResponseTimeMinutes,
      },
      busiestHours,
      perAgent,
    });
  } catch (error) {
    console.error("GET /api/chat/analytics error:", error);
    return NextResponse.json({ error: "Failed to generate chat analytics" }, { status: 500 });
  }
}
