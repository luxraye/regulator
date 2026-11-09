import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, PANEL_ROLES } from "@/lib/session";
import { checkEligibility } from "@/lib/eligibility";
import { newReferenceCode } from "@/lib/reference";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const listSelect = {
  id: true,
  referenceCode: true,
  title: true,
  status: true,
  deadline: true,
  createdAt: true,
  submittedAt: true,
  template: { select: { id: true, code: true, name: true } },
} as const;

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  const where = PANEL_ROLES.includes(user.role) ? {} : { innovatorId: user.id };
  const instances = await prisma.entry.findMany({ where, select: listSelect, orderBy: { createdAt: "desc" } });
  return NextResponse.json(instances);
}

/** An innovator starts an application (a draft idea instance) on an open call. */
export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(["INNOVATOR"]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 140) : "";
  if (!body?.templateId) return badRequest("Choose a call");
  if (title.length < 4) return badRequest("Give your idea a short title (at least 4 characters)");

  const call = await prisma.template.findUnique({ where: { id: body.templateId } });
  if (!call) return notFound("Call not found");
  const now = new Date();
  if (call.status !== "OPEN" || call.opensAt > now || call.closesAt < now) {
    return badRequest("This call is not open for applications");
  }

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  const elig = checkEligibility({
    omang: profile?.omang,
    dateOfBirth: profile?.dateOfBirth,
    youthShareholding: profile?.youthShareholding,
    hasCompany: !!profile?.licenseNumber,
  });
  if (!elig.eligible) {
    return badRequest("Your profile doesn't meet the eligibility rules yet", {
      checks: elig.checks.filter((c) => !c.ok),
    });
  }

  const existing = await prisma.entry.findFirst({
    where: { templateId: call.id, innovatorId: user.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have an application on this call", id: existing.id }, { status: 409 });
  }

  const defaultInstance = await prisma.instance.findFirst({ select: { id: true } });
  const compInstanceId = call.instanceId || defaultInstance?.id;
  if (!compInstanceId) {
    return badRequest("No competition instance is configured for this call");
  }

  let referenceCode = newReferenceCode();
  while (await prisma.entry.findUnique({ where: { referenceCode } })) referenceCode = newReferenceCode();

  const instance = await prisma.entry.create({
    data: {
      referenceCode,
      title,
      instanceId: compInstanceId,
      templateId: call.id,
      innovatorId: user.id,
      deadline: call.closesAt,
      encryptionKey: crypto.randomBytes(32).toString("hex"),
    },
    select: { id: true, referenceCode: true },
  });
  await audit(user.id, "IDEA_STARTED", { entryId: instance.id, instanceId: compInstanceId, metadata: { callCode: call.code, referenceCode } });

  return NextResponse.json(instance, { status: 201 });
}
