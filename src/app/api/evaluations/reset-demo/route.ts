import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Restores the current evaluator's "To score" queue in place (without invalidating
 * their session) so judges can repeatedly test conflict declaration and grading.
 */
export async function POST() {
  const { user, error } = await requireUser(["EVALUATOR", "ADMIN", "SUPERADMIN"]);
  if (error) return error;

  try {
    const evals = await prisma.evaluation.findMany({
      where: {
        evaluatorId: user.id,
        instance: { status: { in: ["UNDER_REVIEW", "SHORTLISTED"] } },
      },
      orderBy: { assignedAt: "desc" },
      include: { instance: { select: { id: true, title: true } } },
    });

    // Prioritize "Pula Pumps" first, plus up to 9 other evaluations so 10 are open to score
    const sorted = [
      ...evals.filter((e) => e.instance.title.includes("Pula Pumps")),
      ...evals.filter((e) => !e.instance.title.includes("Pula Pumps")),
    ].slice(0, 10);

    await Promise.all(
      sorted.map((ev, idx) =>
        prisma.$transaction([
          prisma.evaluation.update({
            where: { id: ev.id },
            data: {
              submittedAt: null,
              // First 6 have conflict already cleared ("In progress"), next 4 prompt "Declare conflict"
              conflict: idx < 6 ? false : null,
              conflictNote: null,
            },
          }),
          prisma.instance.update({
            where: { id: ev.instanceId },
            data: { status: "UNDER_REVIEW" },
          }),
        ]),
      ),
    );

    return NextResponse.json({ status: "ok", restored: sorted.length });
  } catch (err) {
    console.error("Failed to reset evaluator demo queue:", err);
    return NextResponse.json({ error: "Could not reset evaluation queue" }, { status: 500 });
  }
}
