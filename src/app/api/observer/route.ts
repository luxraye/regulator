import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/observer
 * High-level progress telemetry for committee observers (polled every 15s).
 */
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all published/live instances
  const instances = await prisma.instance.findMany({
    where: {
      status: { in: ["PUBLISHED", "LIVE", "CLOSED"] },
    },
    include: {
      partner: { select: { id: true, name: true, slug: true } },
      entries: {
        select: {
          id: true,
          referenceCode: true,
          title: true,
          status: true,
          score: true,
          consensusScore: true,
          consensusNote: true,
          submittedAt: true,
          evaluations: {
            select: {
              id: true,
              total: true,
              submittedAt: true,
              evaluator: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const formatted = instances.map((inst) => {
    const entries = inst.entries;
    const totalEntries = entries.length;
    const submittedEntries = entries.filter((e) => e.status !== "DRAFT").length;
    const evaluatedEntries = entries.filter((e) => e.evaluations.some((ev) => ev.submittedAt)).length;
    const consensusEntries = entries.filter((e) => e.consensusScore !== null).length;
    const shortlistedEntries = entries.filter((e) => e.status === "SHORTLISTED" || e.status === "AWARDED").length;

    // Read stage info from definition if available
    const def = inst.definition as any;
    const stages = Array.isArray(def?.timeline?.stages) ? def.timeline.stages : [];
    const currentStageName = stages.length > 0 ? stages[0].name : "Stage 1";

    return {
      id: inst.id,
      slug: inst.slug,
      name: inst.name,
      partnerName: inst.partner?.name || "CEDA",
      status: inst.status,
      currentStageName,
      updatedAt: inst.updatedAt,
      metrics: {
        totalEntries,
        submittedEntries,
        evaluatedEntries,
        consensusEntries,
        shortlistedEntries,
      },
      entries: entries.map((e) => ({
        id: e.id,
        referenceCode: e.referenceCode,
        title: e.title,
        status: e.status,
        score: e.score,
        consensusScore: e.consensusScore,
        evaluationsCount: e.evaluations.length,
        evaluationsCompleted: e.evaluations.filter((ev) => ev.submittedAt).length,
      })),
    };
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    instances: formatted,
  });
}
