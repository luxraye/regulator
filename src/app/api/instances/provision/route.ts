import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { templateId, licenseeId, deadline } = await req.json();

  if (!templateId || !licenseeId || !deadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const licensee = await prisma.user.findUnique({ where: { id: licenseeId } });
  if (!licensee || licensee.role !== "LICENSEE") {
    return NextResponse.json({ error: "Invalid licensee" }, { status: 400 });
  }

  const encryptionKey = crypto.randomBytes(32).toString("hex");

  const instance = await prisma.instance.create({
    data: {
      templateId,
      licenseeId,
      assignedById: (session.user as any).id,
      deadline: new Date(deadline),
      encryptionKey,
      status: "PENDING",
    },
    include: { template: true, licensee: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: "INSTANCE_PROVISIONED",
      instanceId: instance.id,
      metadata: {
        templateCode: template.code,
        licenseeOrg: licensee.organizationName,
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: licenseeId,
      title: "New Instance Assigned",
      body: `A new ${template.name} (${template.code}) compliance instance has been assigned to your organization. Deadline: ${new Date(deadline).toLocaleDateString()}.`,
    },
  });

  return NextResponse.json(instance, { status: 201 });
}
