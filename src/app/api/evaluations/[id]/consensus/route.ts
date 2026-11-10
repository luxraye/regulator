import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/evaluations/[id]/consensus
 * Returns all submitted evaluations on the same entry once blind evaluations are submitted.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the evaluation to identify entry
  const currentEval = await prisma.evaluation.findUnique({
    where: { id: params.id },
    include: { entry: true },
  });

  if (!currentEval) {
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  }

  // Fetch all evaluations on this entry
  const allEvals = await prisma.evaluation.findMany({
    where: { entryId: currentEval.entryId },
    include: {
      evaluator: { select: { id: true, name: true, email: true } },
    },
  });

  const entry = await prisma.entry.findUnique({
    where: { id: currentEval.entryId },
    select: {
      id: true,
      referenceCode: true,
      title: true,
      consensusNote: true,
      consensusScore: true,
      score: true,
      status: true,
    },
  });

  // Verify blind review rule: peer scores are only visible if current evaluator has submitted their review
  const canSeePeerScores = !!currentEval.submittedAt || ["ADMIN", "SUPERADMIN"].includes(sessionUser.role);

  return NextResponse.json({
    entry,
    canSeePeerScores,
    evaluations: allEvals.map((e) => ({
      id: e.id,
      evaluatorName: canSeePeerScores ? e.evaluator.name : "Anonymous Evaluator",
      total: canSeePeerScores ? e.total : null,
      scores: canSeePeerScores ? e.scores : null,
      feedback: canSeePeerScores ? e.feedback : null,
      submittedAt: e.submittedAt,
      isSelf: e.evaluatorId === sessionUser.id,
    })),
  });
}

/**
 * POST /api/evaluations/[id]/consensus
 * Records agreed consensus note and consensus score.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { consensusNote, consensusScore } = body;

  const currentEval = await prisma.evaluation.findUnique({
    where: { id: params.id },
  });

  if (!currentEval) {
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  }

  const updated = await prisma.entry.update({
    where: { id: currentEval.entryId },
    data: {
      consensusNote: String(consensusNote || "").trim(),
      consensusScore: consensusScore !== undefined ? Number(consensusScore) : undefined,
    },
  });

  return NextResponse.json({
    success: true,
    consensusNote: updated.consensusNote,
    consensusScore: updated.consensusScore,
  });
}
