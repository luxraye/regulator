import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit, notify } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Assign a template to one or more licensees. */
export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { templateId, deadline } = body ?? {};
  const licenseeIds: string[] = Array.isArray(body?.licenseeIds)
    ? body.licenseeIds
    : body?.licenseeId
      ? [body.licenseeId]
      : [];

  if (!templateId || !deadline || licenseeIds.length === 0) {
    return badRequest("Choose a template, at least one licensee and a deadline");
  }
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return badRequest("Deadline is not a valid date");
  if (due.getTime() < Date.now() - 24 * 3600 * 1000) return badRequest("Deadline must be in the future");

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return notFound("Template not found");

  const licensees = await prisma.user.findMany({
    where: { id: { in: licenseeIds }, role: "LICENSEE" },
    select: { id: true, organizationName: true },
  });
  if (licensees.length !== new Set(licenseeIds).size) return badRequest("One or more licensees are invalid");

  const created = [];
  for (const licensee of licensees) {
    const instance = await prisma.instance.create({
      data: {
        templateId,
        licenseeId: licensee.id,
        assignedById: user.id,
        deadline: due,
        encryptionKey: crypto.randomBytes(32).toString("hex"),
        status: "PENDING",
      },
      select: { id: true },
    });
    created.push(instance.id);

    await audit(user.id, "INSTANCE_PROVISIONED", {
      instanceId: instance.id,
      metadata: { templateCode: template.code, licenseeOrg: licensee.organizationName },
    });
    await notify(
      licensee.id,
      "New compliance instance assigned",
      `${template.name} (${template.code}) is due ${due.toLocaleDateString("en-GB")}.`,
      `/dashboard/licensee/instance-runner/${instance.id}`
    );
  }

  return NextResponse.json({ created }, { status: 201 });
}
