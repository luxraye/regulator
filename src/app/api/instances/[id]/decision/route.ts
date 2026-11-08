import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, PANEL_ROLES } from "@/lib/session";
import { audit, notify, notifyRoles } from "@/lib/audit";
import { formatPula } from "@/lib/utils";
import { ACTIONS } from "@/lib/decisions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(PANEL_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const action = ACTIONS[body?.action as string];
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 5000) : "";
  const awardAmount = body?.awardAmount == null || body.awardAmount === "" ? null : Number(body.awardAmount);

  if (!action) return badRequest("Unknown action");
  if (!action.roles.includes(user.role)) return NextResponse.json({ error: "Your role can't take this decision" }, { status: 403 });
  if (action.needsNotes && notes.length < 10) return badRequest("Give the innovator a reason (at least 10 characters)");
  if (action.to === "AWARDED" && (!Number.isFinite(awardAmount) || (awardAmount as number) <= 0)) {
    return badRequest("Enter the award amount in Pula");
  }

  const instance = await prisma.instance.findUnique({ where: { id: params.id }, include: { template: true } });
  if (!instance) return notFound("Idea not found");
  if (!action.from.includes(instance.status)) {
    return badRequest(`This idea is ${instance.status.toLowerCase().replace("_", " ")}; that decision isn't available now`);
  }

  // Only move if nobody else decided in the meantime.
  const updated = await prisma.instance.updateMany({
    where: { id: instance.id, status: instance.status },
    data: {
      status: action.to,
      reviewNotes: notes || instance.reviewNotes,
      reviewedById: user.id,
      reviewedAt: new Date(),
      ...(action.to === "AWARDED" ? { awardAmount: Math.round(awardAmount as number) } : {}),
    },
  });
  if (updated.count === 0) return badRequest("Someone else just decided on this idea. Refresh to see it.");

  await audit(user.id, `IDEA_${action.to}`, {
    instanceId: instance.id,
    metadata: { notes, from: instance.status, ...(awardAmount ? { awardAmount } : {}) },
  });

  if (action.to !== "SHORTLISTED") {
    await notify(
      instance.innovatorId,
      `${instance.referenceCode} ${action.verb}`,
      action.to === "AWARDED" ? `Award: ${formatPula(awardAmount as number)}. ${notes}` : notes,
      `/dashboard/innovator/instance-runner/${instance.id}`
    );
  } else {
    await notifyRoles(
      ["ADJUDICATOR"],
      "Idea ready for the panel",
      `${instance.referenceCode} "${instance.title}" (${instance.template.code}) is ready for adjudication.`,
      `/dashboard/panel/${instance.id}`
    );
  }

  return NextResponse.json({ status: action.to });
}
