import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit, notify } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Programme admin assigns evaluators to a screened idea. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const evaluatorIds: string[] = Array.isArray(body?.evaluatorIds) ? Array.from(new Set<string>(body.evaluatorIds)) : [];
  const days = Math.min(Math.max(Number(body?.days) || 7, 1), 60);
  if (evaluatorIds.length === 0) return badRequest("Choose at least one evaluator");

  const instance = await prisma.entry.findUnique({
    where: { id: params.id },
    include: { template: true, evaluations: { select: { evaluatorId: true } } },
  });
  if (!instance) return notFound("Idea not found");
  if (!["SUBMITTED", "UNDER_REVIEW"].includes(instance.status)) {
    return badRequest("Evaluators can be assigned while an idea is in screening or under evaluation");
  }

  const evaluators = await prisma.user.findMany({
    where: { id: { in: evaluatorIds }, role: "EVALUATOR" },
    select: { id: true, name: true },
  });
  if (evaluators.length !== evaluatorIds.length) return badRequest("One or more people aren't evaluators");

  const already = new Set(instance.evaluations.map((e) => e.evaluatorId));
  const fresh = evaluators.filter((e) => !already.has(e.id));
  const dueAt = new Date(Date.now() + days * 86_400_000);

  await prisma.$transaction([
    prisma.evaluation.createMany({
      data: fresh.map((e) => ({ entryId: instance.id, evaluatorId: e.id, assignedById: user.id, dueAt })),
    }),
    prisma.entry.update({ where: { id: instance.id }, data: { status: "UNDER_REVIEW" } }),
  ]);

  await audit(user.id, "EVALUATORS_ASSIGNED", {
    entryId: instance.id,
    instanceId: instance.instanceId,
    metadata: { evaluators: fresh.map((e) => e.name), dueAt: dueAt.toISOString() },
  });
  for (const e of fresh) {
    await notify(
      e.id,
      "New idea to evaluate",
      `${instance.template?.name ?? "CEDA Innovation Call"}: "${instance.title}". Due ${dueAt.toLocaleDateString("en-GB")}.`,
      "/dashboard/evaluator"
    );
  }
  if (instance.status === "SUBMITTED") {
    await notify(
      instance.innovatorId,
      `${instance.referenceCode} passed screening`,
      "Your idea met the call requirements and is now with independent evaluators.",
      `/dashboard/innovator/instance-runner/${instance.id}`
    );
  }

  return NextResponse.json({ assigned: fresh.length }, { status: 201 });
}
