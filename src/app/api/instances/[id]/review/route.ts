import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit, notify } from "@/lib/audit";

export const dynamic = "force-dynamic";

const OUTCOMES = {
  APPROVED: "approved",
  FLAGGED: "sent back for changes",
  REJECTED: "rejected",
} as const;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const status = body?.status as keyof typeof OUTCOMES;
  const reviewNotes = typeof body?.reviewNotes === "string" ? body.reviewNotes.trim().slice(0, 5000) : "";

  if (!(status in OUTCOMES)) return badRequest("Status must be APPROVED, FLAGGED or REJECTED");
  if (status !== "APPROVED" && !reviewNotes) {
    return badRequest("Please add notes so the licensee knows what to fix");
  }

  const instance = await prisma.instance.findUnique({ where: { id: params.id }, include: { template: true } });
  if (!instance) return notFound("Instance not found");
  if (instance.status !== "SUBMITTED") return badRequest("Only submitted instances can be reviewed");

  const updated = await prisma.instance.update({
    where: { id: params.id },
    data: { status, reviewNotes: reviewNotes || null, reviewedById: user.id, reviewedAt: new Date() },
  });

  await audit(user.id, `INSTANCE_${status}`, { instanceId: instance.id, metadata: { reviewNotes } });
  await notify(
    instance.licenseeId,
    `${instance.template.code} ${OUTCOMES[status]}`,
    reviewNotes || `Your ${instance.template.name} submission was ${OUTCOMES[status]}.`,
    `/dashboard/licensee/instance-runner/${instance.id}`
  );

  return NextResponse.json({ id: updated.id, status: updated.status });
}
