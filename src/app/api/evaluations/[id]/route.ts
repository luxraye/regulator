import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound } from "@/lib/session";
import { schemaOf } from "@/lib/instances";
import { weightedTotal, SCORE_MAX, SCORE_MIN } from "@/lib/scoring";
import { audit, notifyRoles } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * An evaluator's scorecard.
 *  { conflict: boolean, conflictNote? }           declare (once) before seeing the idea
 *  { scores, feedback, privateNote, submit? }      save a draft, or submit when complete
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(["EVALUATOR"]);
  if (error) return error;

  const ev = await prisma.evaluation.findUnique({
    where: { id: params.id },
    include: { instance: { include: { template: true } } },
  });
  if (!ev || ev.evaluatorId !== user.id) return notFound();
  if (ev.submittedAt) return badRequest("This scorecard has already been submitted");
  if (!["UNDER_REVIEW"].includes(ev.instance.status)) return badRequest("This idea is no longer being evaluated");

  const body = await req.json().catch(() => ({}));

  if (typeof body?.conflict === "boolean") {
    if (ev.conflict !== null) return badRequest("You have already declared");
    const conflictNote = typeof body.conflictNote === "string" ? body.conflictNote.trim().slice(0, 1000) : null;
    if (body.conflict && !conflictNote) return badRequest("Briefly describe the conflict");
    await prisma.evaluation.update({ where: { id: ev.id }, data: { conflict: body.conflict, conflictNote } });
    await audit(user.id, body.conflict ? "CONFLICT_DECLARED" : "NO_CONFLICT_DECLARED", {
      instanceId: ev.instanceId,
      metadata: { conflictNote },
    });
    if (body.conflict) {
      await notifyRoles(
        ["ADMIN", "SUPERADMIN"],
        "Evaluator stepped aside",
        `${user.name} declared a conflict on ${ev.instance.referenceCode}. Assign someone else.`,
        `/dashboard/admin/instances/${ev.instanceId}`
      );
    }
    return NextResponse.json({ conflict: body.conflict });
  }

  if (ev.conflict !== false) return badRequest("Declare any conflict of interest first");

  const criteria = schemaOf(ev.instance.template).criteria;
  const raw = (body?.scores ?? {}) as Record<string, unknown>;
  const scores: Record<string, number> = {};
  for (const c of criteria) {
    const v = Number(raw[c.key]);
    if (raw[c.key] != null && raw[c.key] !== "") {
      if (!Number.isInteger(v) || v < SCORE_MIN || v > SCORE_MAX) return badRequest(`${c.label}: score ${SCORE_MIN}–${SCORE_MAX}`);
      scores[c.key] = v;
    }
  }
  const feedback = typeof body?.feedback === "string" ? body.feedback.trim().slice(0, 5000) : null;
  const privateNote = typeof body?.privateNote === "string" ? body.privateNote.trim().slice(0, 5000) : null;
  const total = weightedTotal(criteria, scores);

  if (body?.submit) {
    if (total === null) return badRequest("Score every criterion before submitting");
    if (!feedback || feedback.length < 20) return badRequest("Write at least a couple of sentences of feedback for the innovator");
  }

  await prisma.evaluation.update({
    where: { id: ev.id },
    data: { scores, feedback, privateNote, total, ...(body?.submit ? { submittedAt: new Date() } : {}) },
  });

  if (body?.submit) {
    await audit(user.id, "EVALUATION_SUBMITTED", { instanceId: ev.instanceId, metadata: { total } });

    // When every active evaluator has scored, the idea moves to the panel automatically.
    const all = await prisma.evaluation.findMany({ where: { instanceId: ev.instanceId }, select: { conflict: true, submittedAt: true } });
    const active = all.filter((e) => e.conflict !== true);
    if (active.length > 0 && active.every((e) => e.submittedAt)) {
      const moved = await prisma.instance.updateMany({
        where: { id: ev.instanceId, status: "UNDER_REVIEW" },
        data: { status: "SHORTLISTED" },
      });
      if (moved.count) {
        await audit(user.id, "IDEA_SHORTLISTED", { instanceId: ev.instanceId, metadata: { reason: "all evaluations in" } });
        await notifyRoles(
          ["ADJUDICATOR", "ADMIN"],
          "Idea ready for the panel",
          `All scores are in for ${ev.instance.referenceCode} "${ev.instance.title}".`,
          `/dashboard/panel/${ev.instanceId}`
        );
      }
    }
  }

  return NextResponse.json({ total, submitted: !!body?.submit });
}
